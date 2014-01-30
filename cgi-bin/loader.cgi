#!/usr/bin/perl

use strict;
use DB_File::Lock;
use CGI::Lite;
use LWP::Simple;
use CGI;
use Fcntl qw(:flock);
use URI::Escape;
use JSON;
use XML::DOM;
use DBI;
use UUID::Tiny;
use JavaScript::Beautifier qw/js_beautify/;

sub printXml{
	my $str = shift;
	print "<msg>$str</msg>\n";
}

#Transform a Javascript function into a web worker.
sub transCode{		
	my $source = shift;
	my $params = shift;
	my $templateJS = "
	self.addEventListener('message', function(e){
		var data = e.data;
		switch (data.cmd) {
       		case 'start':
       			weevil_main();
        		break;
        	case 'stop':
        		self.close();
            		break;
		}
        	WEEVIL_MAIN_FUNCTION
	}, false);\n";
	$templateJS =~ s/WEEVIL_MAIN_FUNCTION/$source/g;
	$templateJS =~ s/weevil_main[\s]*\([\w\,\s]+\)/weevil_main\(\)/g;
	$templateJS =~ s/weevil_main\(\)[\s]*\{/weevil_main\(\)\{\nWEEVIL_PARAMS\n/g;
	$templateJS =~ s/WEEVIL_PARAMS/$params/g;
	$templateJS =~	s/\Qreturn\E(?!.*\Qreturn\E)/WEEVIL_LAST_RETURN/s;
	$templateJS =~ s/(WEEVIL_LAST_RETURN)(.*);/self.postMessage($2);/;

	return $templateJS;
	
}

sub getDBConn{
	return DBI->connect('DBI:mysql:weevil', 'weevil', 'YourPassowrd' ) || die "Could not connect to database: $DBI::errstr";
}

print "Content-type: text/xml\n\n";


my $q = CGI->new;
my $p = $q->Vars;
my $i = 1;
my $secret = "AliensExist";

if(defined($p->{cmd})){

	my $id = $p->{id};
	chomp($id);
	print "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	print "<root>\n";
	my $h = $p->{cmd};

	#Clean database
	if($h =~ m/clear/){
		if($p->{secret} eq $secret){
			my $dbh = getDBConn();
			my $sth = $dbh->prepare("TRUNCATE runqueue");
			$sth->execute();
			$sth->finish();
			$sth = $dbh->prepare("TRUNCATE geolocations");
			$sth->execute();
			$dbh->disconnect();
			`/bin/rm -rf ../jobs/*`;
			`/bin/rm -rf ../results/*`;
			print "<msg>cleared</msg>\n";
		}else{
			print "<msg>not authorized</msg>\n";
		}		
	}

	#Returns the installed functions
	if($h =~ m/getstore/){
		opendir(DIR, "../weevils") || die "err";
		my @weevils=grep !/^\./, readdir(DIR);
		closedir(DIR);
		foreach my $w (@weevils){
			print "<weevil>$w</weevil>\n";
		}
	}

	#Enqueue a job
	if($h =~ m/enqueue/){

		my $parser  = XML::DOM::Parser->new();
		
		my $xmlDoc  = $parser->parse($p->{weevil});
		my $source  = $xmlDoc->getElementsByTagName('source')->item(0)->getFirstChild->getNodeValue;
		my $weevilName  = $xmlDoc->getElementsByTagName('name')->item(0)->getFirstChild->getNodeValue;
		my $params  = "";
		my %paramHash  = ();
		my %paramCounter = ();
		my $dotComb = 1;
		for my $param ($xmlDoc->getElementsByTagName('parameters')->item(0)->getChildNodes){
			if($param->getNodeName !~ m/#text/){
				$params = $params."var ".$param->getNodeName."= e.data.".$param->getNodeName.";\n";
				my $plist = [];
				for my $pms ($param->getChildNodes){
					#print FD "$param->getNodeName\n";
					if($pms->getNodeName !~ m/#text/){
						if($pms->getFirstChild->getNodeValue =~ m/^http/){
							my $val = get($pms->getFirstChild->getNodeValue);
							if($val eq ""){
								push(@$plist,"null");
							}else{
								push(@$plist,$val);
							}
						}else{
							push(@$plist,$pms->getFirstChild->getNodeValue);
						}
					}#if
				}#for
				$paramHash{$param->getNodeName}  = $plist;
				$paramCounter{$param->getNodeName} = @$plist;
				
			}#if
		}#for

		foreach my $kc (keys %paramCounter){
			if($paramCounter{$kc} != 0){
				$dotComb *= $paramCounter{$kc};	
			}
		}

		my $first = 0;
		my $advance = 0;
		my $sparams="";	
		while($dotComb != 0){
			$first = 0;
			$advance = 0;
			$sparams = "";
			foreach my $k (keys %paramHash){
        			my $pstr = "<$k>";				
				my $size = @{$paramHash{$k}};
				my $index = $size - $paramCounter{$k};
				$pstr = $pstr.@{$paramHash{$k}}[$index];
				if($advance == 1){ 
						if($paramCounter{$k} > 1){
							$paramCounter{$k} = $paramCounter{$k} - 1; 
							$advance = 0;
						}else {
							$paramCounter{$k} = $size;
						}
				}
				if($first == 0){
					$first = 1;
					$paramCounter{$k} = $paramCounter{$k} - 1;
					if($paramCounter{$k} == 0) {$paramCounter{$k} = $size; $advance = 1;}
		
				}		
				$pstr = "$pstr</$k>\n";
				$sparams = "$sparams $pstr";
				#print FD $pstr;
    			}
			$dotComb--;
				###############JOB##########################
				my $jobUUID = create_UUID_as_string(UUID_V1);
				open(JF, ">../jobs/$jobUUID.xml");
				print JF "<weevil-job>\n";
				print JF "<job-id>$jobUUID</job-id>\n";
				print JF "<name>$weevilName</name>\n";
				print JF "<parameters>\n";
				print JF $sparams;
				print JF "</parameters>\n";
				print JF "<source>\n";
				print JF "jobs/$weevilName.js\n";
				print JF "</source>\n";
				print JF "</weevil-job>\n";
				close(JF);

				my $insertSQL = "INSERT INTO runqueue (job_id, user_id, job_xml_ref, name, status, validation) VALUES (\'$jobUUID\', \'$id\', \'$jobUUID.xml\', \'$weevilName\', 0, 1)";
				my $dbh = getDBConn();
				my $sth = $dbh->prepare($insertSQL);
				$sth->execute();
				$sth->finish();
				$dbh->disconnect();

				############################################
		}

		my $newSource = transCode($source, $params);
		
		open(JSF, ">../jobs/$weevilName.js");
		print JSF js_beautify($newSource);
		close(JSF);

	}
	
	#Dequeue a Job
	if($h =~ m/dequeue/){
		my $uagent = $ENV{HTTP_USER_AGENT};
		my $uip = $ENV{REMOTE_ADDR};
		my $dbh = getDBConn();
		my $bl = $dbh->prepare("LOCK TABLES runqueue write");
		$bl->execute();
		my $sth = $dbh->prepare("SELECT * FROM runqueue WHERE status=0 ORDER BY timestamp LIMIT 1");	
		$sth->execute();	
		my @result_set = $sth->fetchrow_array();
		if(@result_set){
		my $upd = $dbh->prepare("UPDATE runqueue SET status=1,starttime=CURRENT_TIMESTAMP, useragent=\'$uagent\', userip=\'$uip\' WHERE job_id=\'$result_set[0]\'");
		$upd->execute();
		my $el = $dbh->prepare("UNLOCK TABLES");
		$el->execute();
		$sth->finish();
		$bl->finish();
		$el->finish();
		$upd->finish();
		$dbh->disconnect();
		local $/=undef;
		open(FH, "../jobs/$result_set[2]");	
		my $xmlRes = <FH>;
		close(FH);
			
		print $xmlRes;
		}else{
			print "<sleep>10</sleep>\n";
		}
		
	}
	
	#Receive heartbet from browsers and reply back with the geopositions of other browsers.
	if($h =~ m/heartbeat/){
		my $tid = "geo-$id";
		my $latlog = "$p->{lat}:$p->{log}";
		my $flops = "$p->{flops}";
		my $uagent = $ENV{HTTP_USER_AGENT};
		my $uip = $ENV{REMOTE_ADDR};
		
		my $dbh = getDBConn();
		my $sql = $dbh->prepare("SELECT loc FROM geolocations where id=\'$id\'");
		$sql->execute();
		if($sql->fetch){
			my $sqlp = $dbh->prepare("UPDATE geolocations SET loc=\'$latlog\', timestamp=CURRENT_TIMESTAMP, flops=\'$flops\' where id=\'$id\'");
			$sqlp->execute();
			$sqlp =	$dbh->prepare("UPDATE geolocations SET active=false WHERE timestamp < (NOW() - INTERVAL 2 MINUTE)");
			$sqlp->execute();
			$sqlp->finish();	

		}else{
			my $insertSQL = "INSERT INTO geolocations (id, loc, timestamp, useragent, userip, flops) VALUES (\'$id\', \'$latlog\', CURRENT_TIMESTAMP, \'$uagent\', \'$uip\', \'$flops\')";
			my $sqli = $dbh->prepare($insertSQL);
			$sqli->execute();
			$sqli->finish();	
		}
		$sql->finish();

		my $sqll = $dbh->prepare("SELECT loc FROM geolocations WHERE active=true");
		$sqll->execute();
		my $count = 0;
		while(my @results = $sqll->fetchrow_array()){
			$count++;
			print "<geop>$results[0]</geop>\n";
		}
		print "<csize>$count</csize>\n";

		$sqll = $dbh->prepare("SELECT SUM(flops) FROM geolocations WHERE active=true");
		$sqll->execute();
		my $rflops = 0;
		my @res = $sqll->fetchrow_array();
		$rflops = $res[0];
		$rflops = sprintf("%.1f", ($rflops / 1000000) );
		print "<flops>$rflops</flops>\n";
		$sqll->finish();
	
		my $sqlw = $dbh->prepare("SELECT job_id,status,name,timestamp,TIMEDIFF(endtime,starttime) AS duration FROM runqueue WHERE user_id=\'$id\'");
		$sqlw->execute();
		while(my @results = $sqlw->fetchrow_array()){
			print "<weevil>$results[0]##$results[1]##$results[2]##$results[3]##$results[4]</weevil>\n";
		}
		$sqlw->finish();
		
		$dbh->disconnect();
		
	}	

	
	#Explicit leave notification from a browser
	if($h =~ m/end/){
		my $dbh = getDBConn();
		my $sql = $dbh->prepare("UPDATE  geolocations SET active=false WHERE id=\'$id\'");
		$sql->execute();
		$sql->finish();
		$dbh->disconnect();
	}
	
	#Submit results back to server from browser
	if($h =~ m/submit/){
		my $job_id = $p->{job_id};
		my $result = $p->{result};
		my $job_name = $p->{job_name};
		chomp($job_name);
		(-d "../results/".$job_name) || mkdir "../results/".$job_name;
		open(FR, ">../results/".$job_name."/".$job_id."_OUT.html");
		print FR $result;
		close(FR);
		my $sql;
		$sql = "UPDATE runqueue SET status=2 WHERE job_id=\'$job_id\'";
		if($p->{status} == 2){
			$sql = "UPDATE runqueue SET status=2, endtime=CURRENT_TIMESTAMP  WHERE job_id=\'$job_id\'";
		}
		if($p->{status} == 3){
			$sql = "UPDATE runqueue SET status=3, endtime=CURRENT_TIMESTAMP  WHERE job_id=\'$job_id\'";
		}
		my $dbh = getDBConn();
		my $bl = $dbh->prepare($sql);
		$bl->execute();
		$bl->finish();
		$dbh->disconnect();
		print "<status>OK</status>";
		
	}

	print "</root>";
	
}else{
print "not def";
}
