/*global require, alert*/
/*
 *
 * @owner Enter you name here (xxx)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var config = {
	host: window.location.hostname,
	prefix: "/",
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
require.config( {
	baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port: "") + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {
	qlik.setOnError( function ( error ) {
		alert( error.message );
	} );

	qlik.getAppList(function(list) {

		var appList = $('<select />').attr('id', 'app-list').attr('class', 'form-control');
		var label = $('<label>').attr('for', 'selector-content').text('Select App');

		$('#selector-content').append(label).append(appList);

		//creates initial blank option to be selected first in the dropdown
		appList.append('<option value=""></option>');
		
		//create dropdown options for each item in the applist, using the value attribute as the file name
		list.forEach(function(value) {
			appList.append('<option value="' + value.qDocName +'">' + value.qTitle + '</option>');
		});

		//when select bar changes options, renderAudit is called on the seleted item's value attribute, ultimately pulling info from selectd app
		appList.change(function() {
			//clear out any existing tables
			$('#tables').empty();

			var selectedApp = $('#app-list option:selected').val();
			console.log(selectedApp);

			renderAudit(selectedApp);
		});
	});


//takes in an app name ie hockey.qvf and uses it to open the app.  creates array of measures and array of dimensions
function renderAudit(selectedApp) {
		var app = qlik.openApp(selectedApp, config);

		//gets and renders measures table
		app.getList('MeasureList', function(reply) {
			//console.log('measure reply');
			//console.log(reply);
			tabularize(reply.qMeasureList.qItems);
		});

		app.getList('DimensionList', function(reply) {
			//console.log('the dimension reply: ');
			//console.log(reply);
			tabularize(reply.qDimensionList.qItems);
		});

}

//accepts an array of objects and creates a table displaying measure name and id
function tabularize(list) {
		var html = '';
		//var table = $('#tables').append('<table />').attr('class', 'table table-striped');

		html += '<table class="col-lg-3 table table-striped">';

		//add the header to the html variable with header labels
		html += "<thead><tr><th>" + list[0].qInfo.qType.toUpperCase() + "</th><th>ID</th></tr></thead>";

		//add the table body
		html += "<tbody>";

		//iterate over array, and populate the table
		$.each(list, function(index, value) {
			html += "<tr><td>" + value.qData.title + "</td><td>" + value.qInfo.qId + "</td></tr>";
		});

		//close the table body after adding the rows
		html += "</tboy></table>";

		//TODO overwrites the first table with the second table - need to be more dynamic
		$('#tables').append(html);

}


});
