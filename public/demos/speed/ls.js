function val(key ,value){
	if(window.localStorage){
		var str = window.localStorage._user || '{}';
		var ui = byy.json(str);
		console.log(ui);
		if(!value && key){
			return ui[key];
		}else if(key && value){
			ui[key]= value;
			str = byy.stringfy(ui);
			window.localStorage._user = str;
		}else{
			return ui;
		}
	}
}