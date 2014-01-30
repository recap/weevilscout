// Based On
// Version: 1.0
// Author: Adam Skowron ( http://www.przyjaznycms.pl )

self.addEventListener('message', function(e){

var data = e.data;
switch (data.cmd){
	case 'start':
		weevil_main();
		break;
	case 'stop':
		self.close();
		break;
}

//function weevil_main(sequence1, sequence2, type, score, mismatch_award, mismatch_penalty, matrix, penalty, linear_gap, open_gap, prolongation_gap, output_format){
function weevil_main(){
		var retStr = new String();

		// default configuration properties
		var options = {
			type:					1,			// type of alignment: 1 - nucleotide, 2 - aminoacid
			sequence1:				'ATCG',		// sequence 1
			sequence2:				'ATCG',		// sequence 2
			score:					1,			// type of substitution matrix: 1 - own, 2 - substitution matrix
			ma:						1,			// value for match award, if score is 1
			mp:						0,			// value for mismatch penalty, if score is 1
			matrix:					'blosum62',	// name of substituion matrix, if score is 2
			penalty:				'linear',	// type of gap penalty: 'linear' or 'affine'
			gp:						0,			// value of linear gap
			gop:					0,			// value of open gap, if penalty is affine
			gpp:					0,			// value of prolongation gap, if penalty is affine
			outputFormat:				'html'		//html or xml	
		};
		options.sequence1 = sequence1;
		options.sequence2 = sequence2;

		options.type 		= (data.type)? data.type				: 1;
		options.score 		= (data.score)? data.score			: 1;
		options.ma 		= (data.mismatch_award)? data.mismatch_award	: 1;
		options.mp		= (data.mismatch_penalty)? data.mismatch_penalty	: 0;
		options.matrix		= (data.matrix)? data.matrix			: 'blosum62';
		options.penalty		= (data.penalty)? data.penalty			: 'linear';
		options.gp		= (data.linear_gap)? data.linear_gap		: 0;
		options.gop		= (data.open_gap)? data.open_gap			: 0;
		options.gpp		= (data.prolongation_gap)? data.prolongation_gap	: 0;
		options.outputFormat	= (data.output_format)? data.outputFormat		: 'html';
		
		//options = $.extend(defaults, options);
		var nucleotides = 'ACTG';
		var aminoacids = 'ACDEFGHIKLMNPQRSTVWY';
		var cols = options.sequence1.length+1;
		var rows = options.sequence2.length+1;
		var final_score = 0;
		var final_seq1='', final_seq2='', seq_line='';
		var S = new Array(); // macierz podstawien
		var F = new Array(); // macierz finalna
		var _self = this;

		//_getSubstitutionMatrix(options.matrix);
		//return;

		_init();
		_fill();
		_autoalign();

		function _init(){
			(options.score == 2) ? _getSubstitutionMatrix(options.matrix) : ((options.type == 1) ? _createSubstitutionMatrix(nucleotides) : _createSubstitutionMatrix(aminoacids));
			var i = 0, j = 0;
			options.sequence1 = _reverse(options.sequence1);
			options.sequence2 = _reverse(options.sequence2);
			for(i = 0; i < rows; i++){
				F[i] = new Array();
				for(j = 0; j < cols; j++)
					F[i][j] = (i == 0 && j == 0) ? 0 : (i == 0) ? _gap(j+1) : ((j == 0) ? _gap(i+1) : 0);
			}
		}

		function _createSubstitutionMatrix(t){
			if(t.length > 0){
				for(var i = 0; i < t.length; i++) {
					for(var j = 0; j < t.length; j++){
						S[t.charAt(i)+t.charAt(j)] = (t.charAt(i)==t.charAt(j)) ? options.ma : options.mp;
					}
				}
			}
		}
		function _getSubstitutionMatrix(name){
			var data = {};
			var http_request = new XMLHttpRequest();
			http_request.open( "GET", 'js/matrices/'+name+'.json', false );
			http_request.onreadystatechange = function () {
    				if ( http_request.readyState == 4 && http_request.status == 200 ) {
            				data = JSON.parse( http_request.responseText );
					////alert(data[2][3]);
					var len = (options.type == 1) ? 4 : 20;
                                        for(var i = 0; i < len; i++) {
                                                for(var j = 0; j < len; j++){
                                                        if(options.type == 1)
                                                                S[nucleotides.charAt(i)+nucleotides.charAt(j)] = parseInt(data[i][j]);
                                                        else
                                                                S[aminoacids.charAt(i)+aminoacids.charAt(j)] = parseInt(data[i][j]);
                                                }
                                        }

        			}else{return;}
				////alert(data);
			};
			http_request.send(null);

//			$.ajax({
//				url: '/js/matrices/'+name+'.json',
//				dataType: 'json',
//				async: false,
//				success: function(data){
//					var len = (options.type == 1) ? 4 : 20;
//					for(var i = 0; i < len; i++) {
//						for(var j = 0; j < len; j++){
//							if(options.type == 1)
//								S[nucleotides.charAt(i)+nucleotides.charAt(j)] = parseInt(data[i][j]);
//							else
//								S[aminoacids.charAt(i)+aminoacids.charAt(j)] = parseInt(data[i][j]);
//						}
//					}
//				}
//			});
		}

		function _reverse(text){
			return text.split( '' ).reverse().join( '' );
		}

		function _gap(i){
			i = i-1;
			return (options.penalty == 'linear') ? options.gp * i : ((i > 0) ? options.gop + options.gpp * (i) : options.gop);
		}

		function _round(number, x) {
			var x = (!x ? 2 : x);
			return Math.round(number*Math.pow(10,x)) / Math.pow(10,x);
		}

		/* UZUPELNIANIE MACIERZY */
		function _fill(){
			
			var i, j;
			for(i = 1; i < rows; i++){
				for(j = 1; j < cols; j++){
					var tF = _round(_calcCondition(i,j),2);
					if(isNaN(tF)){
						F[i][j] = 0;
					}else{
						F[i][j] = tF;
					}
					
				}
			}
			//alert(F);
		}

		function _calcCondition(i, j){
			var choice1, choice2, choice3, k, _c2, _c3, ch1, ch2;
			ch1 = i-1;
			ch2 = j-1;

			choice1 = S[options.sequence2.charAt(ch1)+options.sequence1.charAt(ch2)] + F[i-1][j-1];
			choice2 = -1000;
			////alert("here2");
			for(k = 1; k < i; k++) {
				_c2 = S[options.sequence2.charAt(ch1)+options.sequence1.charAt(ch2)] + F[i-k][j-1] + _gap(k);
				if(_c2 > choice2) choice2 = _c2;
			}
			////alert("here3");
			choice3 = -1000;
			for(k = 1; k < j; k++) {
				_c3 = S[options.sequence2.charAt(ch1)+options.sequence1.charAt(ch2)] + F[i-1][j-k] + _gap(k);
				if(_c3 > choice3) choice3 = _c3;
			}
			////alert("here4");
			return Math.max(choice1, choice2, choice3);
		}

		function _seqline(s1, s2){			
			if(options.type==1){
				if(s1 == s2){
					return "|";
				}
				else if (s1 == '-' || s2 == '-'){
					return "&nbsp;";
				}
				else {
					return "x";
				}
			}
			else{
				if(s1 == s2){
					return "|";
				}
				else if(options.score == 2 && S[s1+s2] >= 0) {
					return ".";
				}
				else if (s1 == '-' || s2 == '-'){
					return "&nbsp;";
				}
				else {
					return "x";
				}
			}
		}

		/* WYNIK KONCOWY */
		function _autoalign(){
			var i = rows-1; // seq2
			var j = cols-1; // seq1

			var s, s_right, s_bottom, k, ch1, ch2, _c2, _c3, min_i, min_j, max_temp;
			while(i > 0 && j > 0){
				//alert("here1"+i+" "+j);
				s_right = -100000;s_bottom = -100000;
				s = F[i][j];
				ch2 = i-1;ch1 = j-1;

				for(k = 1; k < i; k++) {
					if(F[i-k][j-1] > s_bottom) { min_i = k; s_bottom = F[i-k][j-1]; }
				}

				for(k = 1; k < j; k++) {
					if(F[i-1][j-k] > s_right) { min_j = k; s_right = F[i-1][j-k]; }
				}

				max_temp = Math.max(F[i-1][j-1], s_right, s_bottom);
				//alert("hereXK "+max_temp+" "+F[i-1][j-1]+" "+s_right+" "+s_bottom);

				if(max_temp == F[i-1][j-1]){
					//alert("hereX "+max_temp);
					final_seq1 += options.sequence1.charAt(ch1);
					final_seq2 += options.sequence2.charAt(ch2);
					seq_line += _seqline(options.sequence1.charAt(ch1), options.sequence2.charAt(ch2));
					--i; --j;
				}
				else if(max_temp == s_right){
					//alert("hereY "+max_temp);
					final_seq1 += options.sequence1.charAt(ch1);
					final_seq2 += options.sequence2.charAt(ch2);
					seq_line += _seqline(options.sequence1.charAt(ch1), options.sequence2.charAt(ch2));
					for(var z = 1; z < min_j; z++){
						final_seq1 += options.sequence1.charAt(ch1-z);
						final_seq2 += '-';
						seq_line += _seqline(options.sequence1.charAt(ch1-z), '-');
					}
					//--j;
					j -= min_j;
					i -=1;
				}
				else if(max_temp == s_bottom){
					//alert("hereZ "+max_temp);
					final_seq1 += options.sequence1.charAt(ch1);
					final_seq2 += options.sequence2.charAt(ch2);
					seq_line += _seqline(options.sequence1.charAt(ch1), options.sequence2.charAt(ch2));
					for(var z = 1; z < min_i; z++){
						final_seq2 += options.sequence2.charAt(ch2-z);
						final_seq1 += '-';
						seq_line += _seqline('-', options.sequence2.charAt(ch2-z));
					}
					//--i;
					i -= min_i;
					j -=1;
				}
			}
			while (i > 0) {
				//alert("here2"+i);
				s_right = -100000;s_bottom = -100000;
				final_seq2 += options.sequence2.charAt(i-1);
				final_seq1 += '-';
				seq_line += _seqline('-', options.sequence2.charAt(i-1));
				--i;
			}

			while (j > 0) {
				//alert("here3"+j);
				final_seq1 += options.sequence1.charAt(j-1);
				final_seq2 += '-';
				seq_line += _seqline(options.sequence1.charAt(j-1), '-');
				--j;
			}
			//retStr = retStr + '<br /><b>'+options.msgOptimalAlignment+':</b><br />'+final_seq1+'<br />'+seq_line+'<br />'+final_seq2;
			if(options.outputFormat == 'html'){
				retStr = retStr + '<br /><b>'+options.sequence1+' || '+options.sequence2+':</b><br />'+final_seq1+'<br />'+seq_line+'<br />'+final_seq2;
			}
			if(options.outputFormat == 'xml'){
				retStr = retStr + '<header>'+options.sequence1+' || '+options.sequence2+':</header><seq1>'+final_seq1+'</seq1><seqline>'+seq_line+'</seqline><seq2>'+final_seq2+'</seq2>';
			}
			_autoscore();
		}

		var align_i=rows-1, align_j = cols-1;
		function _align(i, j){
			var timeoutID;
			if(i > 0 && j > 0){
				var s, s_right, s_bottom, k, ch1, ch2, _c2, _c3, min_i, min_j, max_temp;
				s_right = -100000;s_bottom = -100000;
				s = F[i][j];
				ch2 = i-1;ch1 = j-1;

				for(k = 1; k < i; k++) {
					if(F[i-k][j-1] > s_bottom) { min_i = k; s_bottom = F[i-k][j-1]; }
				}

				for(k = 1; k < j; k++) {
					if(F[i-1][j-k] > s_right) { min_j = k; s_right = F[i-1][j-k]; }
				}

				max_temp = Math.max(F[i-1][j-1], s_right, s_bottom);
				
				if(max_temp == F[i-1][j-1]){
					final_seq1 += options.sequence1.charAt(ch1);
					final_seq2 += options.sequence2.charAt(ch2);
					seq_line += _seqline(options.sequence1.charAt(ch1), options.sequence2.charAt(ch2));
					--i;--j;
				}
				else if(max_temp == s_right){
					final_seq1 += options.sequence1.charAt(ch1);
					final_seq2 += options.sequence2.charAt(ch2);
					seq_line += _seqline(options.sequence1.charAt(ch1), options.sequence2.charAt(ch2));
					for(var z = 1; z < min_j; z++){
						final_seq1 += options.sequence1.charAt(ch1-z);
						final_seq2 += '-';
						seq_line += _seqline(options.sequence1.charAt(ch1-z), '-');
					}
					//--j;
					j -= min_j;
					i -=1;
				}
				else if(max_temp == s_bottom){
					final_seq1 += options.sequence1.charAt(ch1);
					final_seq2 += options.sequence2.charAt(ch2);
					seq_line += _seqline(options.sequence1.charAt(ch1), options.sequence2.charAt(ch2));
					for(var z = 1; z < min_i; z++){
						final_seq2 += options.sequence2.charAt(ch2-z);
						final_seq1 += '-';
						seq_line += _seqline('-', options.sequence2.charAt(ch2-z));
					}
					//--i;
					i -= min_i;
					j -=1;
				}
				align_i = i;
				align_j = j;
				timeoutID = setTimeout(function(){_align(i, j)}, options.pause);
			}else{
				while (i > 0) {
					final_seq2 += options.sequence2.charAt(i-1);
					final_seq1 += '-';
					seq_line += _seqline('-', options.sequence2.charAt(i-1));
					--i;
				}
				while (j > 0) {
					final_seq1 += options.sequence1.charAt(j-1);
					final_seq2 += '-';
					seq_line += _seqline(options.sequence1.charAt(j-1), '-');
					--j;
				}
				clearTimeout(timeoutID);
				//retStr = retStr + '<br /><b>'+options.msgOptimalAlignment+':</b><br />'+final_seq1+'<br />'+seq_line+'<br />'+final_seq2;
				//retStr = retStr + '<br /><b>'+options.sequence1+' || '+options.sequence2+':</b><br />'+final_seq1+'<br />'+seq_line+'<br />'+final_seq2;
				if(options.outputFormat == 'html'){
					retStr = retStr + '<br /><b>'+options.sequence1+' || '+options.sequence2+':</b><br />'+final_seq1+'<br />'+seq_line+'<br />'+final_seq2;
				}
				if(options.outputFormat == 'xml'){
					retStr = retStr + '<header>'+options.sequence1+' || '+options.sequence2+':</header><seq1>'+final_seq1+'</seq1><seqline>'+seq_line+'</seqline><seq2>'+final_seq2+'</seq2>';
				}
				_autoscore();
			}
		}

		function _autoscore(){
			var gap_prolongate = 0;
			for(var i = 0; i < final_seq1.length; i++){
				if(final_seq1.charAt(i)=='-' || final_seq2.charAt(i)=='-') {					
					++gap_prolongate;
					if(final_seq1.length == (i+1)){
						final_score += _gap(gap_prolongate+1);
					}
				}
				else{
					if(gap_prolongate > 0){
						final_score += _gap(gap_prolongate+1);
					}
					gap_prolongate = 0;
					final_score += S[final_seq1.charAt(i)+final_seq2.charAt(i)];
				}
			}
			//retStr = retStr + '<br /><b>'+options.msgScore+':</b><br />'+_round(final_score,2);
			if(options.outputFormat == 'html'){
				retStr = retStr + '<br /><b>score: </b>'+_round(final_score,2);
			}
			if(options.outputFormat == 'xml'){
				retStr = retStr + '<score>'+_round(final_score,2)+'</score>';
			}

		}
		//return retStr;
		self.postMessage(retStr);
	}
}, false);
