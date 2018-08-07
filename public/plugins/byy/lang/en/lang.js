var languageMap = {
	/*弹窗*/
	win : {
		ok : 'OK',
		cancel : 'Cancel',
		info : 'Infomation',
		maxlength : 'Can input max numbers is {0}',
		nopic : 'Empty',
		picerror : 'The picture url is error<br>continue next picture?',
		picnext : 'Next',
		picover : 'Over'
	},
	checkbox : {
		before : 'on',
		after : 'off',
		title : 'Check'
	},
	radio : {
		title : 'No Name'
	},
	selectextend : {
		noresult : 'No result has been searched',
		maxmsg : 'Can select max options is {0}',
		search : 'Please input keywords to search'
	},
	select : {
		tip : 'Please select ',
		nosearch : 'No result has benn searched',
		maxlimit : 'Can choose max options is {0}',
		selectall : 'Select All'

	},
	//分页国际化
	page : {
		first : 'First',
		last : 'Last',
		prev : 'Previous',
		next : 'Next',
		total : 'Total {0} ,',
		nomore : 'No More',
		jumpB : 'To ',
		jumpA : 'page',
		okBtn : 'Ok'
	},
	//上传控件
	upload : {
		acceptTitle : 'Custom file',
		dialogTitle : 'Upload Information',
		uploadTip : 'Upload Notice',
		closeWin : 'sure to close the window?',
		removeFile : 'Click to remove',
		uploadInfo : 'Upload Information',
		pauseFile : 'Pause',
		startFile : 'Start',
		scan : 'Scan : {0}',
		secondUpload : 'Speed seconds',
		uploadSuc : 'Upload Success',
		uploadFail : 'Upload Failed',
		uploadFailP : 'Progress',
		uploadFailTry : ', retry after three seconds ... ',
		"Q_EXCEED_NUM_LIMIT" : 'Upload files exceeded the limit',
		"Q_EXCEED_SIZE_LIMIT" : "The total size of the file is out of bounds",
		"F_EXCEED_SIZE" : "The file size is out of bounds,max size {0}",
		"Q_TYPE_DENIED" : "The file type is out of bounds",
		"F_DUPLICATE" : "Duplicate file upload",
		"F_EMPTY_FILE" : "Can not upload empty file",
		progress : 'Progress : {0}',
		btnText : 'Upload File',
		afterUpload : 'Processing file...'

	},
	list : {
		hsearch : 'More Search',
		more : 'More'
	},
	tab : {
		refresh : 'Refresh',
		close : 'Close',
		others : 'Close Other tabs',
		all : 'Close All Tabs'
	},
	table : {
		nodata : 'Not getting the data'
	}
};
byy.define(function( exports ){
	exports('lang',languageMap);
});