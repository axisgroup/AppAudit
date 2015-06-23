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
			tabularize(reply);
		});

		app.getList('DimensionList', function(reply) {
			//console.log('the dimension reply: ');
			console.log(reply);
			tabularize(reply);
		});

		app.getList('BookmarkList', function(reply) {
			//console.log('the dimension reply: ');
			console.log(reply);
			tabularize(reply);
		});

		app.getList('FieldList', function(reply) {
			//console.log('the dimension reply: ');
			console.log(reply);
			tabularize(reply);
		});
}

//accepts an array of objects and creates a table displaying measure name and id
function tabularize(list) {
		//get the type of list
		var listType = list.qInfo.qType;

		//use list type to create variable to hold the data array
		var listData = list['q' + listType].qItems;

		//allows for setting of the header depending on type of list passed in since FieldList is structured differently
		var firstHeader;

		var html = '';

		//sets the appropriate header for first column since FieldList does not have qInfo.qType
		if(listType !== "FieldList") {
			if(listData.length === 0) {

				//TODO find another way to remove the last four items from the array, splice was acting weird
				var tempHeader = listType.split('');
				tempHeader.pop();
				tempHeader.pop();
				tempHeader.pop();
				tempHeader.pop();
				tempHeader = tempHeader.join('');

				firstHeader = tempHeader;
			}
			else firstHeader = listData[0].qInfo.qType;
		}
		else firstHeader = "Field";

		html += '<table class="col-lg-3 col-md-6 col-xs-12 table table-striped">';

		//add the header to the html variable with header labels
		html += "<thead><tr><th>" + firstHeader.toUpperCase() + "</th><th>ID</th></tr></thead>";

		//add the table body
		html += "<tbody>";

		//iterate over array, and populate the table
		if(listData.length === 0){
			html += "<tr><td>Sorry, no data of this type is present in the application</td></tr>";
		}

		//different properties need to be called on the field list object than the others
		if(listType === "FieldList"){
			$.each(listData, function(index, value) {
				html += "<tr><td>" + value.qName + "</td><td>" + "N/A" + "</td></tr>";
			});
		//Since field list is different, everything else will go down this path to populate the tables
		}else{
			$.each(listData, function(index, value) {
				html += "<tr><td>" + value.qData.title + "</td><td>" + value.qInfo.qId + "</td></tr>";
			});
		}

		//close the table body after adding the rows
		html += "</tbody></table>";


		$('#tables').append(html);

}


});
