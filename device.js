// ----- device.codepad -------------------------------------------------------
$.widget("sv.device_codepad", $.sv.widget, {

  initSelector: 'div[data-widget="device.codepad"]',

  options: {
    duration: '5s',
    val: '0000'
  },

  _create: function() {
    this._super();
    var codepad = this.element;
    var id = this.options.id;

    var clickpreventer = $('<div style="position: absolute; width: 3px; height: 3px;">')
    .on('click', function(event) {
      if (!$(this).closest('[data-bind="' + id + '"]').data('access')) {
        codepad.popup('open');
        codepad.find('input').val('').focus();
        codepad.data('originally-clicked', $(this).parent());
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    });

    $('[data-bind="' + id + '"]')
    .on('mouseenter', function(event) {
      clickpreventer.appendTo(this)
      .css({
        left: parseInt(event.pageX - clickpreventer.offsetParent().offset().left)-1,
        top:  parseInt(event.pageY - clickpreventer.offsetParent().offset().top)-1,
        zIndex: Number($(this).css('zIndex'))+1
      });
    })
    .on('mousemove', '*', function(event) {
      clickpreventer.appendTo(this)
      .css({
        left: parseInt(event.pageX - clickpreventer.offsetParent().offset().left)-1,
        top:  parseInt(event.pageY - clickpreventer.offsetParent().offset().top)-1,
        zIndex: Number($(this).css('zIndex'))+1
      });
    });

  },

  _events: {
    'keyup': function (event) {
      if (event.keyCode == 13) {
        this.element.find('[data-val="ok"]').click();
      }
    },

    'click > div > a': function (event) {
      var node = this.element; // $(event.target).parent().parent();
      var code = node.find('input');
      var key = $(event.target).data('val');

      code.focus();

      if (key == "ok") {
        if (this.options.val == code.val().md5()) {
          $('[data-bind="' + node.attr('data-id') + '"]').data('access', new Date().getTime()).removeClass('codepad');
          this._delay(function () {
            $('[data-bind="' + this.options.id + '"]').data('access', '').addClass('codepad');
          }, new Date().duration(this.options.duration).valueOf());
          node.popup("close");
          node.data("originally-clicked").trigger("click");
        }
        else {
          console.log('[device.codepad] ' + node.attr('id') + ' wrong code ' + code.val());
          code.val('');
          node.addClass('ui-focus');
          setTimeout(function () {
            node.removeClass('ui-focus');
          }, 400);
        }
      }
      else if (key == "-") {
        code.val('');
      }
      else {
        code.val(code.val() + key);
      }
    }

  }

});


// ----- device.roofwindow
// ------------------------------------------------------
$.widget("sv.device_roofwindow", $.sv.widget, {

	initSelector: 'div[data-widget="device.roofwindow"]',

	options: {
		min: 0,
		max: 255,
		step: 5,
	},

	_getVal: function(event) {
		var min = this.options.min;
		var max = this.options.max;
		var step = this.options.step;

		var offset = $(event.currentTarget).offset();
		var y = event.pageY - offset.top;
		return max - Math.floor(y / $(event.currentTarget).outerHeight() * (max - min) / step) * step;
	},

	_events: {
		'click .pos': function (event) {
			this._write(this._getVal(event));
		},

		'mouseenter .pos': function (event) {
			this.element.find('.control').fadeIn(400);
		},

		'mouseleave .pos': function (event) {
			this.element.find('.control').fadeOut(400);
		},

		'mousemove .pos': function (event) {
			$(event.currentTarget).attr('title', this._getVal(event));
		}
	}

});


// ----- device.rtrslider-------------------------------------------------------
$.widget("sv.device_rtrslider", $.sv.widget, {

	initSelector: 'div[data-widget="device.rtrslider"]',
	options: {
		step: 0.1,
		scale_interval: 1, 
		scale_min: 18, 
		scale_max: 28, 
	},

	_create: function() {
		this._super();
	},
	
	_update: function(response) {
		var item_names = this.options.item.explode();
		var actualValue = response[0];
		var setValue = response[1];
		var id = this.element.attr('id');
		var scale_min = this.options.scale_min;  // 18;
		var scale_max = this.options.scale_max;  // 28;
		var step = this.options.step * 1;   // 0.1;
		var decs = step.decimals();
		var unit = "??C";
		var scale_interval = this.options.scale_interval;
		
		// some RTR use a different item for temperature offset, eg. MDT
		if (item_names[2] != "")	{
			  var set_old = response[1];
			  var offset_old = response[2];
		}
						
		// get colors
		var bg_color = $('.ui-bar-b').css('background-color');
		var font_color = $('.ui-content').css('color');
		var track_color = $('.ui-bar-a').css('background-image');
		var path_color = $(".ui-bar-a").css('background-color');
		var border_color = $(".ui-bar-b").css('border-bottom-color');
		var handle_color = $(".ui-page-theme-a.ui-btn").css('background-image');
					
		
	// slider for actual value
	$("div#"+id+".outerslider").roundSlider({
		value: actualValue,
		min: scale_min,
		max: scale_max,
		step: step,
		sliderType: "min-range",
		radius: 70,
		showTooltip: true,
		editableTooltip: false,
		circleShape: "full",
		startAngle: "315",
		endAngle: "225",
		handleShape: "round",
		handleSize: "0",
		lineCap: "none",
		width: "8",
		svgMode: true,
		
		update: function(args) {},
		
		create: function(args) {
		  var o = this.options;
		  for (var i = o.min; i <= o.max; i += scale_interval) {
			var angle = this._valueToAngle(i);
			var numberTag = this._addSeperator(angle, "rs-custom");
			var number = numberTag.children();
			number.clone().css({
			  "width": o.width + this._border(),
			  "margin-top": this._border(true) / -2,
			  "margin-right": '10px',
			}).appendTo(numberTag);
			number.removeClass().addClass("rs-number").html(i).rsRotate(-angle);
			$("#"+id+".outerslider .rs-number").css("left", "-25px");
			$("#"+id+".outerslider .rs-number").css("color",font_color); 
			$("#"+id+".outerslider .rs-seperator").css("border-color",border_color );
			$("#"+id+".outerslider .rs-seperator").css("border-width","2px");
			$("#"+id+".outerslider .rs-seperator").css("width","6px");
			// $("#"+id+".outerslider.rs-seperator_1").css("height","1px");
			$("#"+id+".outerslider .rs-seperator").css("margin-left","-6px"); 
			
		  };
		 // scala gerade striche (kurz)
		  var interval = scale_interval/2;
		  for (var i = o.min; i <= o.max; i += interval) {
			var angle = this._valueToAngle(i);
			var numberTag = this._addSeperator(angle, "rs-custom_1");
			numberTag.addClass( "rs-seperator_1" );
			$("#"+id+".outerslider .rs-seperator_1 .rs-seperator").css("border-color",border_color );
			$("#"+id+".outerslider .rs-seperator_1 .rs-seperator").css("border-width","1px");
			$("#"+id+".outerslider .rs-seperator_1 .rs-seperator").css("width","4px");
			$("#"+id+".outerslider .rs-seperator_1 .rs-seperator").css("height","1px");
			$("#"+id+".outerslider .rs-custom_1 .rs-seperator").css("left","-10px");  
			
		  };
		},

		tooltipFormat:function (args){
			return"<span style='position: relative;top:-2.2em;font-size:0.2em;color:"+font_color+"; '>Ist: </span></br><span id ='val' style='position: relative;top:-2.7em;font-weight:bold;font-size:0.45em;color:"+font_color+";'>" + args.value + unit +"</span>";
		},
		rangeColor: function (args) {
			return border_color;
		},
		pathColor: function (args) {
			return path_color;
		},
		borderColor: function (args) {
			return border_color;
		}
	});

	var actualString = (actualValue < 10 ) ? '0'+String(actualValue)+unit : String(actualValue)+unit;
	$("div#"+id+".outerslider .rs-tooltip #val").html(actualString);

	// slider for set value
	$("#"+id+".innerslider").roundSlider({
		value: setValue,
		min: scale_min,
		max: scale_max,
		step: step, 
		width: 12,
		sliderType: "min-range",
		radius: 62,
		showTooltip: false,
		circleShape: "full",
		startAngle: "315",
		endAngle: "225",
		handleShape: "round",
		handleSize: "25",
		lineCap: "none",
		editableTooltip: false,
		svgMode: true,
		update: function (args) {
			if (item_names[2] != "") { 
				var delta = args.value - set_old;
				io.write(item_names[2], (offset_old + delta).toFixed(decs));
			}
			else
				io.write(item_names[1], args.value);	
		},
	
		tooltipColor: function (args) {
			return font_color;
		},
		rangeColor: function (args) {
			return bg_color;
		},
		pathColor: function (args) {
			return path_color;
		},
		borderColor: function (args) {
			return border_color;
		},
			
		create: function() {
			$("#"+id).find(".inner-handle").css({
				'position': 'absolute',
				'left': '-35px'}
				);
		  }
		});
	},
	
	_events: {
	}
});


  // ----- device.uzsu
	// ----------------------------------------------------------
  // ----------------------------------------------------------------------------
  //
  // Neugestaltetes UZSU Widget zur Bedienung UZSU Plugin
  //
  // Darstellung der UZSU Eintr??ge und Darstellung Widget in Form eine Liste
	// mit den Eintr??gen
  // Umsetzung
  // (c) Michael W??rtenberger 2014,2015,2016
  //
  // APL 2.0 Lizenz
  //
  // Basis der Idee des dynamischen Popups ??bernommen von John Chacko
  // jQuery Mobile runtime popup
  // 16. November 2012 ?? 0 Comments
  // http://johnchacko.net/?p=44
  //
  // ----------------------------------------------------------------------------
  // Basis der Architektur: document.update und document.click baut die
	// handler in die Seite f??r das Popup ein.
  // document.update kopiert bei einem update die Daten aus dem Backend (per
	// Websocket) in das DOM Element ("uzsu") ein
  // document.click ??bernimmt die Daten aus dem DOM Element in Variable des JS
	// Bereichs und baut ??ber runtimepopup
  // dynamisch header, body und footer des popup zusammen und h??ngt sie an die
	// aktuelle seite an (append, pagecreate)
  // danach werden die Daten aus den Variablen in die Elemente der Seite
	// kopiert. Die Elemente der Seite bilden immer
  // den aktuellen Stand ab und werden von dort in die Variablen
	// zur??ckgespeichert, wenn notwendig (save, sort).
  // In der Struktur k??nnen Zeilen angeh??ngt (add) oder gel??scht werden (del).
	// Dies geschieht immer parallel in den Variablen
  // und den Elementen der Seite. Die Expertenzeilen werden immer sofort mit
	// angelegt, sind aber zu Beginn nicht sichtbar.
  // Beim verlassen des Popups werden die dynamisch angelegten DOM Elemente
	// wieder gel??scht (remove).
  //
  // Datenmodell: Austausch ??ber JSON Element
  // { "active" : bool,
  // "list" : Liste von eintr??gen mit schaltzeiten
  // [ "active" :false, Ist der einzelne Eintrag darin aktiv ?
  // "rrule" :'', Wochen / Tag Programmstring
  // "time" :'00:00', Uhrzeitstring des Schaltpunktes / configuration
  // "value" :0, Wert, der gesetzt wird
  // "event": 'time', Zeitevent (time) oder SUN (sunrise oder sunset)
  // "timeMin" :'', Untere Schranke SUN
  // "timeMax" :'', Oberere Schranke SUN
  // "timeCron" :'00:00', Schaltzeitpunkt
  // "timeOffset":'' Offset f??r Schaltzeitpunkt
  // "timeOffsetType":'m' 'm' = Offset in Minuten, '' Offset in H??hengrad
	// (Altitude)
  // "condition" : { Ein Struct f??r die Verwendung mit conditions (aktuell nur
	// FHEM), weil dort einige Option mehr angeboten werden
  // "deviceString" : text Bezeichnung des Devices oder Auswertestring
  // "type" : text Auswertetype (logische Verkn??pfung oder Auswahl String)
  // "value" : text Vergleichwert
  // "active" : bool Aktiviert ja/nein
  // }
  // "delayedExec": { Ein Struct f??r die Verwendung mit delayed exec (aktuell
	// nur FHEM), weil dort einige Option mehr angeboten werden
  // "deviceString" : text Bezeichnung des Devices oder Auswertestring
  // "type" : text Auswertetype (logische Verkn??pfung oder Auswahl String)
  // "value" : text Vergleichwert
  // "active" : bool Aktiviert ja/nein
  // }
  // "holiday": {
  // "workday" : bool Aktiviert ja/nein
  // "weekend" : bool Aktiviert ja/nein
  // }
  // ]
  // }

// Base widget for devie_uzsuicon and device_uzsugraph
$.widget("sv.device_uzsu", $.sv.widget, {

  _create: function() {
    this._super();
    this.options.designtype = String(this.options.designtype);
    if(this.options.designtype === undefined || this.options.designtype === '') {
      this.options.designtype = io.uzsu_type;
    }
  },

  _update: function(response) {
    // data-item ist der sh.py item, in dem alle Attribute lagern, die f??r die
	// Steuerung notwendig ist ist ja vom typ dict. das item, was tats??chlich
	// per
    // Schaltuhr verwendet wird ist nur als attribut (child) enthalten und wird
	// ausschliesslich vom Plugin verwendet. wird f??r das r??ckschreiben der
	// Daten an smarthome.py ben??tigt

    // wenn keine Daten vorhanden, dann ist kein item mit den eigenschaften
	// hinterlegt und es wird nichts gemacht
    if (response.length === 0){
      notify.error("UZSU widget", "No UZSU data available in item '" + this.options.item + "' for widget " + this.options.id + ".");
      return;
    }

    this._uzsudata = jQuery.extend(true, {}, response[0]);

    // Initialisierung zun??chst wird festgestellt, ob Item mit Eigenschaft
	// vorhanden. Wenn nicht: active = false
    // ansonsten ist der Status von active gleich dem gesetzten Status
    if (!(this._uzsudata.list instanceof Array)) {
      this._uzsudata = { active: false, list: [] };
    }
  },

  _uzsuBuildTableHeader: function() {
    // Kopf und ??berschrift des Popups
    var tt = "";
    // hier kommt der Popup Container mit der Beschreibung ein Eigenschaften
    tt +=   "<div data-role='popup' data-overlay-theme='b' data-theme='a' class='messagePopup' id='uzsuPopupContent' data-dismissible = 'false' data-history='false' data-position-to='window'>" +
          "<button data-rel='back' data-icon='delete' data-iconpos='notext' class='ui-btn-right' id='uzsuClose'></button>" +
          "<div class='uzsuClear'>" +
            "<div class='uzsuPopupHeader'>" + this.options.headline + "</div>" +
            "<div class='uzsuTableMain' id='uzsuTable'>";
    return tt;
  },

  _uzsuBuildTableRow: function(numberOfRow) {
    // default Werte setzen fuer valueParameterList
    var valueType = this.options.valuetype;
    var valueParameterList = this.options.valueparameterlist.explode();
    if(valueParameterList.length === 0){
      if(valueType === 'bool') valueParameterList = ['On','Off'];
      else if (valueType === 'num') valueParameterList = [''];
      else if (valueType === 'text') valueParameterList = [''];
      else if (valueType === 'list') valueParameterList = [''];
    }
    // Tabelleneintr??ge
    var tt = "";

    tt +=   "<div class='uzsuRow'>" +
          "<div class='uzsuCell'>" +
            "<div class='uzsuCellText'>" + sv_lang.uzsu.weekday + "</div>" +
              "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true' class='uzsuWeekday'>";
              // rrule Wochentage (ist eine globale Variable von SV, Sonntag
				// hat index 0 deshalb Modulo 7)
              var daydate = new Date(0);
              $.each([ 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU' ], function(index, value) {
                daydate.setDate(5 + index); // Set date to one on according
											// weekday (05.01.1970 was a monday)
                tt += "<label title='" + daydate.transUnit('l') + "'><input type='checkbox' value='" + value + "'>" + daydate.transUnit('D') + "</label>";
              });
    tt +=      "</fieldset>" +
            "</div>";

    tt +=   "<div class='uzsuCell uzsuValueCell'>" +
          "<div class='uzsuCellText'>" + sv_lang.uzsu.value + "</div>";
    if (this.options.valuetype === 'bool') {
      // Unterscheidung Anzeige und Werte
      if (valueParameterList[0].split(':')[1] === undefined) {
        tt += "<select data-role='flipswitch'>" +
                "<option value='0'>" + valueParameterList[1] + "</option>" +
                "<option value='1'>"  + valueParameterList[0] + "</option>" +
              "</select>";
      }
      else {
        tt += "<select data-role='flipswitch'>" +
                "<option value='" + valueParameterList[1].split(':')[1]  + "'>" + valueParameterList[1].split(':')[0] + "</option>" +
                "<option value='" + valueParameterList[0].split(':')[1]  + "'>" + valueParameterList[0].split(':')[0] + "</option>" +
              "</select>";
      }
    }
    else if (this.options.valuetype === 'num') {
      var addedclass = (parseFloat(valueParameterList[0]) < 0) ? "" : " positivenumbers";
      tt +=   "<input type='number' min='" + parseFloat(valueParameterList[0]) + "' max='" + parseFloat(valueParameterList[1]) + "' step='" + parseFloat(valueParameterList[2]) + "' data-clear-btn='false' class='uzsuValueInput" + addedclass + "' pattern='[0-9]*'>";
    }
    else if (this.options.valuetype === 'text') {
      tt +=   "<input type='text' data-clear-btn='false' class='uzsuTextInput'>";
    }
    else if (this.options.valuetype === 'list') {
      // das Listenformat mit select ist sehr umfangreich nur einzubauen.
      tt +=   "<select data-mini='true'>";
              for (var numberOfListEntry = 0; numberOfListEntry < valueParameterList.length; numberOfListEntry++) {
                // Unterscheidung Anzeige und Werte
                if (valueParameterList[0].split(':')[1] === undefined) {
                  tt += "<option value='" + valueParameterList[numberOfListEntry].split(':')[0]  + "'>"+ valueParameterList[numberOfListEntry].split(':')[0]  + "</option>";
                }
                else {
                  tt += "<option value='" + valueParameterList[numberOfListEntry].split(':')[1]  + "'>"+ valueParameterList[numberOfListEntry].split(':')[0]  + "</option>";
                }
              }
      tt +=   "</select>";
    }
    tt+=  "</div>"
    tt+=  "<div class='uzsuCell'>" +
          "<div class='uzsuCellText'>" + sv_lang.uzsu.time + "</div>" +
          "<input type='time' data-clear-btn='false' class='uzsuTimeInput uzsuTimeCron'>" +
        "</div>" +
        "<div class='uzsuCell'>" +
          "<div class='uzsuCellText'></div>" +
          "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
            "<label><input type='checkbox' class='uzsuActive'>" + sv_lang.uzsu.act + "</label>" +
          "</fieldset>" +
        "</div>" +
        "<div class='uzsuCellExpert'>" +
          "<div class='uzsuCellText'>" + sv_lang.uzsu.expert + "</div>" +
          "<button data-mini='true' data-icon='arrow-d' data-iconpos='notext' class='ui-icon-shadow'></button>" +
        "</div>" +
        "<div class='uzsuCell'>" +
          "<div class='uzsuCellText'></div>" +
          "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
            "<button class='uzsuDelTableRow' data-mini='true'>" + sv_lang.uzsu.del + "</button>" +
          "</fieldset>" +
        "</div>";
    // Tabelle Zeile abschliessen
    tt +=   "</div>";
    // und jetzt noch die unsichtbare Expertenzeile
    tt +=   "<div class='uzsuRowExpHoli' style='display:none;'>" +
          "<div class='uzsuRowExpert' style='float: left;'>" +
            "<div class='uzsuRowExpertText'>" + sv_lang.uzsu.sun + "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>" + sv_lang.uzsu.earliest + "</div>" +
              "<input type='time' data-clear-btn='false' class='uzsuTimeMaxMinInput uzsuTimeMin'>" +
            "</div>" +
            "<div class='uzsuCell uzsuEvent'>" +
              "<div class='uzsuCellText'>Event</div>" +
              "<select data-mini='true' data-native-menu='false'>" +
                "<option value='sunrise'>" + sv_lang.uzsu.sunrise + "</option>" +
                "<option value='sunset'>" + sv_lang.uzsu.sunset + "</option>" +
              "</select>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>+/-" + (this.options.designtype == '0' ? '' : ' min.') +"</div>" +
              "<input type='number' data-clear-btn='false' class='uzsuTimeMaxMinInput uzsuTimeOffsetInput'>" +
            "</div>";
          // Auswahl f??r Offset in Grad oder Minuten (nur f??r SmartHomeNG)
          if (this.options.designtype == '0'){
            tt +=   "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'></div>" +
                "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true' class='uzsuTimeOffsetTypeInput'>" +
                  "<label title='Minutes'><input type='radio' name='uzsuTimeOffsetTypeInput"+numberOfRow+"' value='m' checked='checked'>m</label>" +
                  "<label title='Degrees of elevation'><input type='radio' name='uzsuTimeOffsetTypeInput"+numberOfRow+"' value=''>??</label>" +
              "</fieldset>" +
            "</div>";
          }
            tt +=   "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>" + sv_lang.uzsu.latest + "</div>" +
              "<input type='time' data-clear-btn='false' class='uzsuTimeMaxMinInput uzsuTimeMax'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'></div>" +
              "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
                "<label><input type='checkbox' class='expertActive uzsuSunActive'>" + sv_lang.uzsu.act + "</label>" +
              "</fieldset>" +
            "</div>";
            // UZSU Interpolation
            if(sv_lang.uzsu.interpolation && this.hasInterpolation){
              tt +=   "<div class='uzsuCell'>" +
                "<div class='uzsuCellText'>" + sv_lang.uzsu.calculated + "</div>" +
                "<div data-tip='" + sv_lang.uzsu.calculatedtip + "'>" +
                "<input type='time' data-clear-btn='false' class='uzsuTimeMaxMinInput uzsuCalculated' disabled>" +
                "</div>" +
              "</div>";
            }
          tt += "</div>";
      // hier die Eintr??ge f??r holiday weekend oder nicht
      if (this.options.designtype == '2'){
        tt +=   "<div class='uzsuRowHoliday' style='float: left;'>" +
              "<div class='uzsuRowHolidayText'>Holiday</div>" +
              "<div class='uzsuCell'>" +
                "<div class='uzsuCellText'>Holiday</div>" +
                "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
                  "<label><input type='checkbox' class='expertActive uzsuHolidayWorkday'>!WE</label>" +
                   "<label><input type='checkbox' class='expertActive uzsuHolidayWeekend'>WE</label>" +
                "</fieldset>" +
              "</div>" +
            "</div>";
      }
      tt+=   "</div>";

    // und jetzt noch die unsichbare Condition und delayed Exec Zeile
    if(this.options.designtype == '2'){
      tt +=   "<div class='uzsuRowCondition' style='display:none;'>" +
            "<div class='uzsuRowConditionText'>Condition</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Device / String</div>" +
              "<input type='text' data-clear-btn='false' class='uzsuConditionDeviceStringInput'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Condition Type</div>" +
              "<select data-mini='true' class='uzsuConditionType'>" +
                "<option value='eq'>=</option>" +
                "<option value='<'><</option>" +
                "<option value='>'>></option>" +
                "<option value='>='>>=</option>" +
                "<option value='<='><=</option>" +
                "<option value='ne'>!=</option>" +
                "<option value='String'>String</option>" +
              "</select>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Value</div>" +
              "<input type='text' data-clear-btn='false' class='uzsuConditionValueInput'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'></div>" +
              "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
                "<label><input type='checkbox' class='expertActive uzsuConditionActive'>Act</label>" +
              "</fieldset>" +
            "</div>" +
          "</div>";
      // delayed exec zeile
      tt +=   "<div class='uzsuRowDelayedExec' style='display:none;'>" +
            "<div class='uzsuRowDelayedExecText'>DelayedExec</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Device / String</div>" +
              "<input type='text' data-clear-btn='false' class='uzsuDelayedExecDeviceStringInput'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>DelayedExec Type</div>" +
              "<select data-mini='true' class='uzsuDelayedExecType'>" +
                "<option value='eq'>=</option>" +
                "<option value='<'><</option>" +
                "<option value='>'>></option>" +
                "<option value='>='>>=</option>" +
                "<option value='<='><=</option>" +
                "<option value='ne'>!=</option>" +
                "<option value='String'>String</option>" +
              "</select>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Value</div>" +
              "<input type='text' data-clear-btn='false' class='uzsuDelayedExecValueInput'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'></div>" +
              "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
                "<label><input type='checkbox' class='expertActive uzsuDelayedExecActive'>Act</label>" +
              "</fieldset>" +
            "</div>" +
          "</div>";
    }
    return tt;
  },

  _uzsuFillTableRow: function(responseEntry, tableRow) {
    var self = this;
    // dann die Werte einer Tabellenzeile f??llen

    uzsuCurrentRows = $(tableRow).nextUntil('.uzsuRow').addBack();

    if(responseEntry.value != null) {
      // beim Schreiben der Daten Unterscheidung, da sonst das Element falsch
		// genutzt wird mit Flipswitch f??r die bool Variante
      if (self.options.valuetype === 'bool') {
        uzsuCurrentRows.find('.uzsuValueCell select').val(responseEntry.value).flipswitch("refresh");
      }
      // mit int Value f??r die num Variante
      else if ((self.options.valuetype === 'num') || (self.options.valuetype === 'text')) {
        uzsuCurrentRows.find('.uzsuValueCell input').val(responseEntry.value);
      }
      else if (self.options.valuetype === 'list') {
        uzsuCurrentRows.find('.uzsuValueCell select').val(responseEntry.value).selectmenu('refresh', true);
      }
    }
    // Values in der Zeile setzen
    uzsuCurrentRows.find('.uzsuActive').prop('checked',responseEntry.active).checkboxradio("refresh");
    // hier die conditions, wenn sie im json angelegt worden sind und zwar pro
	// zeile !
    if(self.options.designtype == '2'){
      // Condition
      uzsuCurrentRows.find('.uzsuConditionDeviceStringInput').val(responseEntry.condition.deviceString);
      uzsuCurrentRows.find('select.uzsuConditionType').val(responseEntry.condition.type).selectmenu('refresh', true);
      uzsuCurrentRows.find('.uzsuConditionValueInput').val(responseEntry.condition.value);
      uzsuCurrentRows.find('.uzsuConditionActive').prop('checked',responseEntry.condition.active).checkboxradio("refresh");
      // Delayed Exec Zeile
      uzsuCurrentRows.find('.uzsuDelayedExecDeviceStringInput').val(responseEntry.delayedExec.deviceString);
      uzsuCurrentRows.find('select.uzsuDelayedExecType').val(responseEntry.delayedExec.type).selectmenu('refresh', true);
      uzsuCurrentRows.find('.uzsuDelayedExecValueInput').val(responseEntry.delayedExec.value);
      uzsuCurrentRows.find('.uzsuDelayedExecActive').prop('checked',responseEntry.delayedExec.active).checkboxradio("refresh");
    }
    uzsuCurrentRows.find('.uzsuTimeMin').val(responseEntry.timeMin);
    uzsuCurrentRows.find('.uzsuTimeOffsetInput').val(parseInt(responseEntry.timeOffset));
    if(self.options.designtype == '0') {
      // name='uzsuTimeOffsetTypeInput'
      uzsuCurrentRows.find('.uzsuTimeOffsetTypeInput').find(':radio').prop('checked', false).checkboxradio("refresh")
        .end().find('[value="'+responseEntry.timeOffsetType+'"]:radio').prop('checked', true).checkboxradio("refresh");
    }
    uzsuCurrentRows.find('.uzsuTimeMax').val(responseEntry.timeMax);
    uzsuCurrentRows.find('.uzsuTimeCron').val(responseEntry.timeCron);
    if(responseEntry.calculated != null) {
      uzsuCurrentRows.find('.uzsuCalculated').val(responseEntry.calculated);
    }
    // und die pull down Men??s richtig, damit die Eintr??ge wieder stimmen und
	// auch der active state gesetzt wird
    if(responseEntry.event === 'time'){
      uzsuCurrentRows.find('.uzsuSunActive').prop('checked',false).checkboxradio("refresh");
    }
    else{
      uzsuCurrentRows.find('.uzsuSunActive').prop('checked',true).checkboxradio("refresh");
      uzsuCurrentRows.find('.uzsuRowExpert .uzsuEvent select').val(responseEntry.event).selectmenu('refresh', true);
    }
    // in der Tabelle die Werte der rrule, dabei gehe ich von dem Standardformat
	// FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU aus und setze f??r jeden Eintrag
	// den Button.
    var rrule = responseEntry.rrule;
    if (typeof rrule === "undefined") {
      rrule = '';
    }
    var ind = rrule.indexOf('BYDAY');
    // wenn der Standard drin ist
    if (ind > 0) {
      var days = rrule.substring(ind);
      // Setzen der Werte
      uzsuCurrentRows.find('.uzsuWeekday input[type="checkbox"]').each(function(numberOfDay) {
        $(this).prop('checked', days.indexOf($(this).val()) > 0).checkboxradio("refresh");
      });
    }
    // jetzt die holiday themem f??r fhem
    if(self.options.designtype == '2'){
      uzsuCurrentRows.find('.uzsuHolidayWorkday').prop('checked', responseEntry.holiday.workday).checkboxradio("refresh");
      uzsuCurrentRows.find('.uzsuHolidayWeekend').prop('checked', responseEntry.holiday.weekend).checkboxradio("refresh");
    }
    // Fallunterscheidung f??r den Expertenmodus
    self._uzsuSetSunActiveState(uzsuCurrentRows.find('.uzsuRowExpert .uzsuEvent select'));
    self._uzsuSetExpertColor(uzsuCurrentRows.find('.expertActive').first());
  },

  // ----------------------------------------------------------------------------
  // Funktionen f??r das dynamische Handling der Seiteninhalte des Popups
  // ----------------------------------------------------------------------------
  // Setzt die Farbe des Expertenbuttons, je nach dem, ob eine der Optionen
	// aktiv geschaltet wurde
  _uzsuSetExpertColor: function(changedCheckbox){
    var rows = changedCheckbox.parents('.uzsuRowExpHoli, .uzsuRowCondition, .uzsuRowDelayedExec').prevAll('.uzsuRow').first().nextUntil('.uzsuRow').addBack();
    if (rows.find('.expertActive').is(':checked'))
      rows.find('.uzsuCellExpert button').addClass('ui-btn-active');
    else
      rows.find('.uzsuCellExpert button').removeClass('ui-btn-active');
  },

  // Toggelt die eingabem??glichkeit f??r SUN Elemente in Abh??ngigkeit der
	// Aktivschaltung
  _uzsuSetSunActiveState: function(element){
    // status der eingaben setzen, das brauchen wir an mehreren stellen
    var uzsuRowExpHoli = element.parents('.uzsuRowExpHoli');
    var uzsuTimeCron = uzsuRowExpHoli.prevUntil('.uzsuRowExpHoli').find('.uzsuTimeCron');
    var uzsuCalc = uzsuRowExpHoli.find('.uzsuCalculated').val();
    if (uzsuRowExpHoli.find('.uzsuSunActive').is(':checked')){
      uzsuTimeCron.attr('type','input').val(uzsuRowExpHoli.find('.uzsuEvent select').val()).textinput('disable');
    }
    else{
      if(uzsuTimeCron.val().indexOf('sun')===0)
        uzsuTimeCron.attr('type','time').val((uzsuCalc == undefined || uzsuCalc == '') ? '00:00' : uzsuCalc);
      uzsuTimeCron.textinput('enable');
    }
  },

  // Expertenzeile mit Eingaben auf der Hauptzeile benutzbar machen oder
	// sperren bzw. die Statusupdates in die Zeile eintragen
  _uzsuShowExpertLine: function(e) {
    // erst einmal alle verschwinden lassen
    this._uzsuHideAllExpertLines();
    // Tabellezeile ermitteln, wo augerufen wurde
    var uzsuExpertButton = $(e.currentTarget);
    var row = uzsuExpertButton.closest('.uzsuRow');
    // Zeile anzeigen
    row.nextUntil('.uzsuRow').show();
    // jetzt noch den Button in der Zeile dr??ber auf arrow up ??ndern
    uzsuExpertButton.buttonMarkup({ icon: "arrow-u" });
  },
  _uzsuHideAllExpertLines: function() {
    $('.uzsuRowExpHoli, .uzsuRowCondition, .uzsuRowDelayedExec').hide();
    $('.uzsuCellExpert button').buttonMarkup({ icon: "arrow-d" });
  },

  // Interpolationszeile
  _uzsuShowInterpolationLine: function(e) {

    // erst einmal alle verschwinden lassen
    // this._uzsuHideInterpolationLine();
    // Tabellezeile ermitteln, wo augerufen wurde
    var uzsuInterpolationButton = $(e.currentTarget);
    $('#uzsuRowInterpolation').show();
    // jetzt noch den Button in der Zeile dr??ber auf arrow up ??ndern
    uzsuInterpolationButton.buttonMarkup({ icon: "arrow-u" });
  },
  _uzsuHideInterpolationLine: function() {
    $('#uzsuRowInterpolation').hide();
    $('.uzsuCellInterpolation button').buttonMarkup({ icon: "arrow-d" });
  },

  _uzsuSaveTableRow: function(responseEntry, tableRow) {
    var self = this;

    uzsuCurrentRows = $(tableRow).nextUntil('.uzsuRow').addBack();
    responseEntry.value = uzsuCurrentRows.find('.uzsuValueCell select, .uzsuValueCell input').val();
    responseEntry.active = uzsuCurrentRows.find('.uzsuActive').is(':checked');
    // hier die conditions, wenn im json angelegt
    if(self.options.designtype == '2'){
      // conditions
      responseEntry.condition.deviceString = uzsuCurrentRows.find('.uzsuConditionDeviceStringInput').val();
      responseEntry.condition.type = uzsuCurrentRows.find('select.uzsuConditionType').val();
      responseEntry.condition.value = uzsuCurrentRows.find('.uzsuConditionValueInput').val();
      responseEntry.condition.active = uzsuCurrentRows.find('.uzsuConditionActive').is(':checked');
      // deleayed exec
      responseEntry.delayedExec.deviceString = uzsuCurrentRows.find('.uzsuDelayedExecDeviceStringInput').val();
      responseEntry.delayedExec.type = uzsuCurrentRows.find('select.uzsuDelayedExecType').val();
      responseEntry.delayedExec.value = uzsuCurrentRows.find('.uzsuDelayedExecValueInput').val();
      responseEntry.delayedExec.active = uzsuCurrentRows.find('.uzsuDelayedExecActive').is(':checked');
    }
    responseEntry.timeMin = uzsuCurrentRows.find('.uzsuTimeMin').val();
    responseEntry.timeOffset = uzsuCurrentRows.find('.uzsuTimeOffsetInput').val();
    if(self.options.designtype == '0'){
      responseEntry.timeOffsetType = uzsuCurrentRows.find('.uzsuTimeOffsetTypeInput :radio:checked').val();
    }
    responseEntry.timeMax = uzsuCurrentRows.find('.uzsuTimeMax').val();
    responseEntry.timeCron = uzsuCurrentRows.find('.uzsuTimeCron').val();
    // event etwas komplizierter, da ??bergangsl??sung
    if(uzsuCurrentRows.find('.uzsuSunActive').is(':checked')){
      responseEntry.event = uzsuCurrentRows.find('.uzsuEvent select').val();
    }
    else{
      responseEntry.event = 'time';
    }
    // in der Tabelle die Werte der rrule, dabei gehe ich von dem Standardformat
	// FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU aus und setze f??r jeden Eintrag
	// den Button. Setzen der Werte.
    var first = true;
    var rrule = '';
    uzsuCurrentRows.find('.uzsuWeekday input[type="checkbox"]').each(function(numberOfDay) {
      if ($(this).is(':checked')) {
        if (first) {
          first = false;
          rrule = 'FREQ=WEEKLY;BYDAY=' + $(this).val();
        }
        else {
          rrule += ',' + $(this).val();
        }
      }
    });
    responseEntry.rrule = rrule;
    // jetzt die holiday themem f??r fhem
    if(self.options.designtype === '2'){
      responseEntry.holiday.workday = uzsuCurrentRows.find('.uzsuHolidayWorkday').is(':checked');
      responseEntry.holiday.weekend = uzsuCurrentRows.find('.uzsuHolidayWeekend').is(':checked');
    }
  },

  _uzsuParseAndCheckResponse: function(response) {
    var designType = this.options.designtype;
    var valueType = this.options.valuetype;

    // Fehlerbehandlung f??r ein nicht vorhandenes DOM Objekt. Das response
	// Objekt ist erst da, wenn es mit update angelegt wurde. Da diese
    // Schritte asynchron erfolgen, kann es sein, dass das Icon bereits da ist,
	// clickbar, aber nocht keine Daten angekommen. Dann darf ich nicht auf
	// diese Daten zugreifen wollen !
    if(response.list === undefined){
      notify.error("UZSU widget", "No UZSU data available in item '" + this.options.item + "' for widget " + this.id + ".");
      return false;
    }

    // jetzt kommt noch die Liste von Pr??fungen, damit hinterher keine Fehler
	// passieren, zun??chst fehlerhafter designType (unbekannt)
    if ((designType != '0') && (designType != '2')) {
      notify.error("UZSU widget", "Design type '" + designType + "' is not supported in widget " + this.id + ".");
      return false;
    }
    // fehlerhafter valueType (unbekannt)
    if ((valueType !== 'bool') && (valueType !== 'num')  && (valueType !== 'text') && (valueType !== 'list')) {
      notify.error("UZSU widget", "Value type '" + valueType + "' is not supported in widget " + this.id + ".");
      return false;
    }

    // Interpolation f??r SmartHomeNG setzen
    if(designType == '0') {
      if(response.interpolation === undefined){
        this.hasInterpolation = false
        console.log('UZSU interpolation not available. You have to update the plugin version');
        // response.interpolation =
		// {type:'none',interval:0,initage:0,initialized:false,itemtype:'none'};
      }
      else if(!response.interpolation.itemtype in ['num']) {
        this.hasInterpolation = false
        notify.warn('UZSU interpolation not supported by itemtype');
      }
      else {
        this.hasInterpolation = true
        console.log('UZSU interpolation set to ' + response.interpolation.type);
      }
    }

    //
    // Umsetzung des time parameters in die Struktur, die wir hinterher nutzen
	// wollen
    //
    $.each(response.list, function(numberOfRow, entry) {

      // bei designType '0' wird rrule nach Wochentagen umgewandelt und ein
		// festes Format vorgegegeben hier sollte nichts versehentlich
		// ??berschrieben werden
      if (designType == '0') {
        // "time" von SmartHomeNG parsen
        var timeParts = (entry.time || "").match(/^((\d{1,2}:\d{1,2})<)?(sunrise|sunset)(([+-]\d+)([m??]?))?(<(\d{1,2}:\d{1,2}))?$/);
        if(timeParts == null) { // entry.time is a plain time string
          entry.event = "time";
          entry.timeCron = entry.time;
          entry.timeMin = "";
          entry.timeMax = "";
          entry.timeOffset = "";
          entry.timeOffsetType = "m";
        }
        else { // entry.time is a sun event
          entry.event = timeParts[3];
          entry.timeCron = '00:00';
          entry.timeMin = timeParts[2];
          entry.timeMax = timeParts[8];
          entry.timeOffset = Number(timeParts[5]);
          entry.timeOffsetType = timeParts[6];
        }
        delete entry.time;

        // test, ob die RRULE fehlerhaft ist
        if (entry.rrule && (entry.rrule.length > 0) && (entry.rrule.indexOf('FREQ=WEEKLY;BYDAY=') !== 0)) {
          if (!confirm("Error: Parameter designType is '0', but saved RRULE string in UZSU '" + entry.rrule + "' does not match default format FREQ=WEEKLY;BYDAY=MO... on item " + this.options.item  + ". Should this entry be overwritten?")) {
            return false;
          }
        }

      }

      // wenn designType = '2' und damit fhem auslegung ist muss der JSON
		// String auf die entsprechenden eintr??ge erweitert werden (falls nichts
		// vorhanden)
      if (designType == '2') {
        // test, ob die eintr??ge f??r conditions vorhanden sind
        if (entry.condition === undefined){
          entry.condition = {deviceString:'',type:'String',value:'',active:false};
        }
        // test, ob die eintr??ge f??r delayed exec vorhanden sind
        if (entry.delayedExec === undefined){
          entry.delayedExec = {deviceString:'',type:'String',value:'',active:false};
        }
        // test, ob die eintr??ge f??r holiday gesetzt sind
        if (entry.holiday === undefined){
          entry.holiday = {workday:false, weekend:false};
        }
      }
    });

    return true;
  },

  _uzsuCollapseTimestring: function(response){
    var self = this;

    // Clear unused properties for FHEM
    if (self.options.designtype == '2') {
      delete response.interpolation;
    }

    $.each(response.list, function(numberOfEntry, entry) {
      // zeitstring wieder zusammenbauen, falls Event <> 'time', damit wir den
		// richtigen Zusammenbau im zeitstring haben
      if(entry.event === 'time'){
        // wenn der eintrag time ist, dann kommt die zeit rein
        entry.time = entry.timeCron;
      }
      else{
        // ansonsten wird er aus den Bestandteilen zusammengebaut
        entry.time = '';
        if(entry.timeMin != null && entry.timeMin.length > 0){
          entry.time += entry.timeMin + '<';
        }
        entry.time += entry.event;
        if(entry.timeOffset > 0){
          entry.time += '+' + entry.timeOffset + (entry.timeOffsetType == undefined ? '' : entry.timeOffsetType);
        }
        else if(entry.timeOffset < 0){
          entry.time += entry.timeOffset + (entry.timeOffsetType == undefined ? '' : entry.timeOffsetType);
        }
        if(entry.timeMax != null && entry.timeMax.length > 0){
          entry.time += '<' + entry.timeMax;
        }
      }

      // Clear unused properties for SmartHomeNG
      if (self.options.designtype == '0') {
        delete entry.event;
        delete entry.timeCron;
        delete entry.timeMin;
        delete entry.timeMax;
        delete entry.timeOffset;
        delete entry.timeOffsetType;
        delete entry.condition;
        delete entry.delayedExec;
        delete entry.holiday;
      }
      // Clear unused properties for FHEM
      else if (self.options.designtype == '2') {
        // delete entry.time; TODO: unsure if this is used in FHEM or not. if
		// not, the code above does not needto be executed in designType=2
      }

    });
  },

});

  // ----- device.uzsuicon
	// ------------------------------------------------------
  // ----------------------------------------------------------------------------
$.widget("sv.device_uzsuicon", $.sv.device_uzsu, {

  initSelector: '[data-widget="device.uzsuicon"]',

  options: {
    valueparameterlist: null,
    headline: '',
    designtype: '',
    valuetype: 'bool'
  },

  _update: function(response) {
    this._super(response);

    // Das Icon wird aktiviert, falls Status auf aktiv, ansonsten deaktiviert
	// angezeigt. Basiert auf der Implementierung von aschwith
    if(this._uzsudata.active === true) {
      this.element.find('.icon-off').hide();
      this.element.find('.icon-on').show();
    }
    else {
      this.element.find('.icon-on').hide();
      this.element.find('.icon-off').show();
    }
  },

  _events: {
    'click': function(event) {
      // hier werden die Parameter aus den Attributen herausgenommen und beim
		// ??ffnen mit .open(....) an das Popup Objekt ??bergeben
      // und zwar mit deep copy, damit ich bei cancel die urspr??nglichen werte
		// nicht ??berschrieben habe
      var response = jQuery.extend(true, {}, this._uzsudata);

      if (this._uzsuParseAndCheckResponse(response)) {
        // ??ffnen des Popups bei clicken des icons und Ausf??hrung der
		// Eingabefunktion
        this._uzsuRuntimePopup(response);
      }
    }
  },

  // ----------------------------------------------------------------------------
  // Funktionen f??r den Seitenaufbau
  // ----------------------------------------------------------------------------
  _uzsuBuildTableFooter: function() {

    var tt = "";
    // Zeileneintr??ge abschliessen und damit die uzsuTableMain
    tt += "</div>";
    // Aufbau des Footers
      tt += "<div class='uzsuTableFooter'>" +
          "<div class='uzsuRowFooter'>" +
            "<span style='float:right'>";
              // UZSU Interpolation
              if(sv_lang.uzsu.interpolation && this.hasInterpolation){
                tt += "<div class='uzsuCellInterpolation' style='float:left;'>" +
                  "<div class='uzsuCellText'>" + sv_lang.uzsu.options + "</div>" +
                  "<button data-mini='true' data-icon='arrow-d' data-iconpos='notext' class='ui-icon-shadow'></button>" +
                "</div>";
              }
              tt+= "<div class='uzsuCell' style='float: left'>" +
                "<form>" +
                  "<fieldset data-mini='true'>" +
                    "<label><input type='checkbox' id='uzsuGeneralActive'>" + sv_lang.uzsu.active + "</label>" +
                  "</fieldset>" +
                "</form>" +
              "</div>" +
              "<div class='uzsuCell' style='float: left'>" +
              "<div data-role='controlgroup' data-type='horizontal' data-inline='true' data-mini='true'>" +
                "<button id='uzsuAddTableRow'>" + sv_lang.uzsu.add + "</button>" +
                "<button id='uzsuSortTime'>" + sv_lang.uzsu.sort + "</button>" +
              "</div>" +
            "</div>" +
              "<div class='uzsuCell' style='float: right'>" +
                  "<div data-role='controlgroup' data-type='horizontal' data-inline='true' data-mini='true'>" +
                    "<button id='uzsuCancel'>" + sv_lang.uzsu.cancel + "</button>" +
                    "<button id='uzsuSaveQuit'>" + sv_lang.uzsu.ok + "</button>" +
                  "</div>" +
                "</div>" +
              "</div>" +
            "</span>";
            if(sv_lang.uzsu.interpolation && this.hasInterpolation){
              tt +=
                "<div id='uzsuRowInterpolation' style='display: none; float: right; margin: 0 15px 5px 0;'>" +
                  "<span style='float:left; margin-right: 12px;'>" +
                    "<div class='uzsuRowExpertText'>" + sv_lang.uzsu.interpolation + "</div>" +
                    "<div class='uzsuCell'>" +
                      "<div class='uzsuCellText'>" + sv_lang.uzsu.interpolation + "</div>" +
                      "<select data-mini='true' data-native-menu='false' id='uzsuInterpolationType'>" +
                        "<option value='none'>" + sv_lang.uzsu.nointerpolation + "</option>" +
                        "<option value='cubic'>" + sv_lang.uzsu.cubic + "</option>" +
                        "<option value='linear'>" + sv_lang.uzsu.linear + "</option>" +
                      "</select>" +
                    "</div>" +
                    "<div class='uzsuCell'>" +
                      "<div class='uzsuCellText'>" + sv_lang.uzsu.intervaltime + "</div>" +
                      "<input type='number' data-clear-btn='false' id='uzsuInterpolationInterval' style='width:50px;' min='0' class='uzsuValueInput positivenumbers'>" +
                    "</div>" +
                  "</span>" +
                  "<span style='float:left; margin-left: 12px;'>" +
                    "<div class='uzsuRowExpertText'>" + sv_lang.uzsu.inittime + "</div>" +
                    "<div class='uzsuCell'>" +
                      "<div class='uzsuCellText'>" + sv_lang.uzsu.inittime_header + "</div>" +
                      "<input type='number' data-clear-btn='false' id='uzsuInitAge' style='width:50px;' min='0' class='uzsuValueInput positivenumbers'>" +
                      "<div class='uzsuCellText' style='visibility:hidden'><label><input type='checkbox' id='uzsuInitialized'>Init</label></div>" +
                    "</div>" +
                  "</span>" +
                "</div>";
              }
            tt +=
          "</div>";
    // und der Abschluss des uzsuClear als Rahmen f??r den float:left und des
	// uzsuPopup divs
    tt += "</div></div>";
    return tt;
  },

  _uzsuFillTable: function(response) {
    var self = this;
    // Tabelle f??llen. Es werden die Daten aus der Variablen response gelesen
	// und in den Status Darstellung der Widgetbl??cke zugewiesen. Der aktuelle
	// Status in dann in der Darstellung enthalten !
    var numberOfEntries = response.list.length;
    // jetzt wird die Tabelle bef??llt allgemeiner Status, bitte nicht mit attr,
	// sondern mit prop, siehe //
	// https://github.com/jquery/jquery-mobile/issues/5587
    // INTERPOLATION
    if(this.hasInterpolation) {
      $('#uzsuInterpolationType').val(response.interpolation.type).selectmenu("refresh", true);
      $('#uzsuInterpolationInterval').val(response.interpolation.interval);
      $('#uzsuInitAge').val(response.interpolation.initage);
      $('#uzsuInitialized').prop('checked', response.interpolation.initialized).checkboxradio("refresh");
    }
    $('#uzsuGeneralActive').prop('checked', response.active).checkboxradio("refresh");
    // dann die Werte der Tabelle
    $('.uzsuRow').each(function(numberOfRow, tableRow) {
      var responseEntry = response.list[numberOfRow];
      self._uzsuFillTableRow(responseEntry, tableRow);
    });
    // Verhindern negativer Zahleneingabe
    $('.positivenumbers').keypress(function(evt){
        var charCode = (evt.which) ? evt.which : event.keyCode;
        return !(charCode > 31 && (charCode < 48 || charCode > 57));
    });
  },

  _uzsuSaveTable: function(response, saveSmarthome) {
    var self = this;
    // Tabelle auslesen und speichern
    var numberOfEntries = response.list.length;
    // hier werden die Daten aus der Tabelle wieder in die items im Backend
	// zur??ckgespielt bitte darauf achten, dass das zur??ckspielen exakt dem der
	// Anzeige enspricht. Gesamthafte Aktivierung
    response.active = $('#uzsuGeneralActive').is(':checked');
    // Interpolation
    if(this.hasInterpolation) {
      response.interpolation.type = $('#uzsuInterpolationType').val();
      response.interpolation.interval = $('#uzsuInterpolationInterval').val();
      response.interpolation.initage = $('#uzsuInitAge').val();
      response.interpolation.initialized = $('#uzsuInitialized').is(':checked');
    }
    // Einzeleintr??ge
    $('.uzsuRow').each(function(numberOfRow, tableRow) {
      var responseEntry = response.list[numberOfRow];
      self._uzsuSaveTableRow(responseEntry, tableRow);
    });
    // ??ber json Interface / Treiber herausschreiben
    if (saveSmarthome) {
      this._uzsuCollapseTimestring(response);
      this._write(response);
    }
  },

  // ----------------------------------------------------------------------------
  // Funktionen f??r das Erweitern und L??schen der Tabelleneintr??ge
  // ----------------------------------------------------------------------------
  _uzsuAddTableRow: function(response) {
    // Tabellenzeile einf??gen
    // alten Zustand mal in die Liste rein. da der aktuelle Zustand ja nur im
	// Widget selbst enthalten ist, wird er vor dem Umbau wieder in die Variable
	// response zur??ckgespeichert.
    this._uzsuSaveTable(response, false);
    // ich h??nge immer an die letzte Zeile dran ! erst einmal das Array
	// erweitern
    response.list.push({active:false,rrule:'',value:null,event:'time',timeMin:'',timeMax:'',timeCron:'00:00',timeOffset:'',timeOffsetType:'m',condition:{deviceString:'',type:'String',value:'',active:false},delayedExec:{deviceString:'',type:'String',value:'',active:false},holiday:{workday:false,weekend:false}});
    // dann eine neue HTML Zeile genenrieren
    tt = this._uzsuBuildTableRow(response.list.length);
    // Zeile in die Tabelle einbauen
    $(tt).appendTo('#uzsuTable').enhanceWithin();
    // und Daten ausf??llen. hier werden die Zeile wieder mit dem Status
	// beschrieben. Status ist dann wieder im Widget
    this._uzsuFillTable(response);
    // nach unten scrollen
    $("#uzsuTable").scrollTop(function() { return this.scrollHeight; });
  },

  _uzsuDelTableRow: function(response, e) {
    // Zeile und Zeilennummer heraus finden
    var row = $(e.currentTarget).closest('.uzsuRow');
    var numberOfRowToDelete = row.parent().find('.uzsuRow').index(row);
    // Daten aus der Liste l??schen
    response.list.splice(numberOfRowToDelete, 1);
    // Die entsprechende Zeile inkl. den nachfolgenden Expertenzeilen aus dem
	// DOM entfernen
    row.nextUntil('.uzsuRow').addBack().remove();
  },

  // ----------------------------------------------------------------------------
  // Funktionen f??r das Sortrieren der Tabelleneintr??ge
  // ----------------------------------------------------------------------------
  _uzsuSortTime: function(response, e) {
    // erst aus dem Widget zur??cklesen, sonst kann nicht im Array sortiert
	// werden (alte daten)
    this._uzsuSaveTable(response, false);
    // sortieren der Listeneintr??ge nach zeit
    response.list.sort(function(a, b) {
      // sort Funktion, wirklich vereinfacht f??r den speziellen Fall
      // erg??nzt um das sunrise und sunset Thema
      var A = a.timeCron.replace(':', '');
      var B = b.timeCron.replace(':', '');
      // Reihenfolge ist erst die Zeiten, dann sunrise, dann sunset
      if(A == 'sunrise') A = '2400';
      if(A == 'sunset') A = '2401';
      if(B == 'sunrise') B = '2400';
      if(B == 'sunset') B = '2401';
      return (A - B);
    });
    // dann die Eintr??ge wieder schreiben
    this._uzsuFillTable(response);
  },

  // ----------------------------------------------------------------------------
  // Funktionen f??r den Aufbau des Popups und das Einrichten der Callbacks
  // ----------------------------------------------------------------------------
  _uzsuRuntimePopup: function(response) {
    var self = this;
    // Steuerung des Popups erst einmal wird der Leeranteil angelegt
    // erst den Header, dann die Zeilen, dann den Footer
    var tt = this._uzsuBuildTableHeader();
    for (var numberOfRow = 0; numberOfRow < response.list.length; numberOfRow++) {
      tt += this._uzsuBuildTableRow(numberOfRow);
    }
    tt += this._uzsuBuildTableFooter();
    // dann h??ngen wir das an die aktuelle Seite
    var uzsuPopup = $(tt).appendTo(this.element).enhanceWithin().popup().on({
      popupbeforeposition: function(ev, ui) {
        var maxHeight = $(window).height() - 230;
        $(this).find('.uzsuTableMain').css('max-height', maxHeight + 'px').css('overflow-y','auto').css('overflow-x','hidden');
      },
      popupafteropen: function(ev, ui) {
        $(this).popup('reposition', {y: 30})
      },
      popupafterclose: function(ev, ui) {
        $(this).remove();
        $(window).off('resize', self._onresize);
      }
    });
    // dann speichern wir uns f??r cancel die urspr??nglichen im DOM gespeicherten
	// Werte in eine Variable ab
    var responseCancel = jQuery.extend(true, {}, response);
    // dann die Werte eintragen.
    this._uzsuFillTable(response);
    // Popup schliessen mit close rechts oben in der Box oder mit Cancel in der
	// Leiste
    uzsuPopup.find('#uzsuClose, #uzsuCancel').bind('click', function(e) {
      // wenn keine ??nderungen gemacht werden sollen (cancel), dann auch im
		// cache die alten Werte
      uzsuPopup.popup('close');
    });

    // speichern mit SaveQuit
    uzsuPopup.find('#uzsuSaveQuit').bind('click', function(e) {
      // jetzt wird die Kopie auf das Original kopiert und geschlossen
      self._uzsuSaveTable(response, true);
      uzsuPopup.popup('close');
    });
    // Eintrag hinzuf??gen mit add
    uzsuPopup.find('#uzsuAddTableRow').bind('click', function(e) {
      self._uzsuAddTableRow(response);
    });
    // Eintrag sortieren nach Zeit
    uzsuPopup.find('#uzsuSortTime').bind('click', function(e) {
      self._uzsuSortTime(response);
    });
    // L??schen mit del als Callback eintragen
    uzsuPopup.delegate('.uzsuDelTableRow', 'click', function(e) {
      self._uzsuDelTableRow(response, e);
    });
    // call Expert Mode
    uzsuPopup.delegate('.uzsuCellExpert button', 'click', function(e) {
      if($(this).hasClass('ui-icon-arrow-u'))
        self._uzsuHideAllExpertLines();
      else
        self._uzsuShowExpertLine(e);
    });
    // Handler, um den expert button Status zu setzen
    uzsuPopup.delegate('input.expertActive', 'change', function (){
      self._uzsuSetExpertColor($(this));
    });
    // Handler, um den Status anhand des Pulldowns SUN zu setzen
    uzsuPopup.delegate('.uzsuRowExpert .uzsuEvent select, input.uzsuSunActive', 'change', function (){
      self._uzsuSetSunActiveState($(this));
    });
    // call Interpolation Mode
    uzsuPopup.delegate('.uzsuCellInterpolation button', 'click', function(e) {
      if($(this).hasClass('ui-icon-arrow-u'))
        self._uzsuHideInterpolationLine();
      else
        self._uzsuShowInterpolationLine(e);
    });

    // hier wir die aktuelle Seite danach durchsucht, wo das Popup ist und im
	// folgenden das Popup initialisiert, ge??ffnet und die schliessen
    // Funktion daran gebunden. Diese entfernt wieder das Popup aus dem DOM Baum
	// nach dem Schliessen mit remove
    uzsuPopup.popup('open'); // .css({ position: 'fixed', top: '30px' });
  }

});

// ----- device.uzsugraph -----------------------------------------------------
// ----------------------------------------------------------------------------
$.widget("sv.device_uzsugraph", $.sv.device_uzsu, {

  initSelector: '[data-widget="device.uzsugraph"]',

  options: {
    valueparameterlist: null,
    headline: '',
    designtype: '',
    valuetype: 'bool',
    editable: false
  },

  rruleDays: {
    'MO': 0,
    'TU': 1,
    'WE': 2,
    'TH': 3,
    'FR': 4,
    'SA': 5,
    'SU': 6
  },

  _startTimestamp: 4*1000*60*60*24 + new Date(0).getTimezoneOffset()*1000*60,

  _create: function() {
    this._super();

    var self = this;

    // init data (used if no update follows because item does not exist yet)
    this._uzsudata = { active : true, list : [] }

    this.options.designtype = String(this.options.designtype);
    if(this.options.designtype === undefined || this.options.designtype === '') {
      this.options.designtype = io.uzsu_type;
    }

    var valueParameterList = this.options.valueparameterlist.explode();
    if(valueParameterList.length === 0){
      if(this.options.valuetype === 'bool') valueParameterList = ['1', '0', '1'];
      else if (this.options.valuetype === 'num') valueParameterList = [''];
      else if (this.options.valuetype === 'list') valueParameterList = [''];
    }

    var min = null, max = null, step = 1;
    if(this.options.valuetype === 'bool') {
      if(valueParameterList.length === 0)
        valueParameterList = ['0', '1'];
      min = parseFloat(valueParameterList[1].split(':')[1] !== undefined ? valueParameterList[1].split(':')[1] : valueParameterList[1]);
      max = parseFloat(valueParameterList[0].split(':')[1] !== undefined ? valueParameterList[0].split(':')[1] : valueParameterList[0]);
      step = 1;
    }
    if(this.options.valuetype === 'num') {
      if(valueParameterList.length === 0)
        valueParameterList = []
      min = parseFloat(valueParameterList[0]);
      max = parseFloat(valueParameterList[1]);
      step = parseFloat(valueParameterList[2]) || 1;
    }

    var timeStep = 1000*60*5; // round to 5 minutes

    // Highcharts symbols for sunrise and sunset
    Highcharts.SVGRenderer.prototype.symbols.sunrise = function (x, y, w, h) {
      var wt = w/300, ht = h/300;
      var xt = x-20*wt, yt = y-20*ht-120*ht;
      return [
        'M',xt+ 79*wt,yt+267*ht,'h',   -4*wt,      'c',-3*wt,0   ,-5*wt, 2*ht,-5*wt, 5*ht,    'c',0,3*ht,2*wt,5*ht,5*wt,5*ht,'h',  4*wt,       'c', 3*wt, 0   ,  5*wt, -2*ht,  5*wt, -5*ht,                                    'c',0,-3*ht,-2*wt,-5*ht,-5*wt,-5*ht,'z',
        'M',xt+232*wt,yt+267*ht,'h',  -48*wt,      'c',-7*wt,0   ,-7*wt,10*ht, 0   ,10*ht,                                   'h', 48*wt,       'c', 7*wt, 0   ,  7*wt,-10*ht,  0   ,-10*ht,                                    'z',
        'M',xt+ 72*wt,yt+217*ht,'l',   18*wt,19*ht,'c', 5*wt,5*ht,12*wt,-3*ht, 8*wt,-7*ht,                                   'l',-19*wt,-19*ht,'c',-5*wt,-4*ht,-12*wt,  3*ht, -7*wt,  7*ht,                                    'z',
        'M',xt+127*wt,yt+172*ht,'v',   49*ht,      'c', 0   ,6*ht,10*wt, 6*ht,10*wt, 0*ht,                                   'v',-49*ht,       'c', 0   ,-7*ht,-10*wt, -7*ht,-10*wt,  0   ,                                    'z',
        'M',xt+201*wt,yt+194*ht,'l',  -34*wt,35*ht,'c',-5*wt,4*ht, 2*wt,12*ht, 7*wt, 7*ht,                                   'l', 34*wt,-35*ht,'c', 5*wt,-4*ht, -2*wt,-11*ht, -7*wt, -7*ht,                                    'z',
        'M',xt+195*wt,yt+239*ht,'l',  -14*wt, 5*ht,'c',-2*wt,1*ht,-4*wt, 4*ht,-3*wt, 7*ht,0   , 2*ht, 3*wt, 4*ht, 6*wt, 3*ht,'l', 14*wt, -6*ht,'c', 2*wt,-1*ht,  4*wt, -3*ht,  3*wt, -6*ht, 0   ,-2*ht,-3*wt,-4*ht,-6*wt,-3*ht,'z',
        'M',xt+154*wt,yt+206*ht,'l',   -6*wt,14*ht,'c',-1*wt,3*ht, 1*wt, 6*ht, 4*wt, 6*ht,2*wt, 1*ht, 5*wt,-1*ht, 6*wt,-3*ht,'l',  5*wt,-14*ht,'c', 1*wt,-2*ht, -1*wt, -5*ht, -3*wt, -6*ht,-3*wt,-1*ht,-5*wt, 1*ht,-6*wt, 3*ht,'z',
        'M',xt+101*wt,yt+209*ht,'l',    6*wt,14*ht,'c', 1*wt,2*ht, 3*wt, 4*ht, 6*wt, 3*ht,3*wt, 0   , 5*wt,-3*ht, 4*wt,-6*ht,'l', -6*wt,-14*ht,'c',-1*wt,-2*ht, -3*wt, -4*ht, -6*wt, -3*ht,                                    's',-5*wt,4*ht,-4*wt,6*ht,'z',
        'M',xt+286*wt,yt+281*ht,'H',xt+75*wt,      'c',-7*wt,0   ,-7*wt,10*ht, 0   ,10*ht,                                   'h',211*wt,       'c', 7*wt, 0   ,  7*wt,-10*ht,  0*wt,-10*ht,                                    'z',
        'M',xt+ 74*wt,yt+252*ht,'l',    8*wt, 4*ht,'c', 2*wt,1*ht, 5*wt,-1*ht, 6*wt,-4*ht,0   ,-3*ht,-1*wt,-5*ht,-4*wt,-6*ht,'l', -8*wt, -3*ht,'c',-2*wt,-1*ht, -5*wt,  1*ht, -6*wt,  3*ht,-1*wt, 3*ht, 1*wt, 5*ht, 4*wt, 6*ht,'z',
        'M',xt+ 94*wt,yt+280*ht,'v',  -29*ht,      'c', 0   ,-11*ht,9*wt,-20*ht,20*wt,-20*ht,                                'h', 35*wt,       'c',11*wt, 0   , 20*wt,  9*ht, 20*wt, 20*ht,                                    'v',29*ht
      ];
    };
    Highcharts.SVGRenderer.prototype.symbols.sunset = function (x, y, w, h) {
      var wt = w/300, ht = h/300;
      var xt = x-20*wt+w*1.1, yt = y-20*ht-120*ht;
      return [
        'M',xt+ wt-(79*wt),yt+267*ht,'h',   wt-(-4*wt),      'c',wt-(-3*wt),0   ,wt-(-5*wt), 2*ht,wt-(-5*wt), 5*ht,    'c',0,3*ht,wt-(2*wt),5*ht,wt-(5*wt),5*ht,'h',  wt-(4*wt),       'c', wt-(3*wt), 0   ,  wt-(5*wt), -2*ht,  wt-(5*wt), -5*ht,                                    'c',0,-3*ht,wt-(-2*wt),-5*ht,wt-(-5*wt),-5*ht,'z',
        'M',xt+wt-(232*wt),yt+267*ht,'h',  wt-(-48*wt),      'c',wt-(-7*wt),0   ,wt-(-7*wt),10*ht, 0   ,10*ht,                                   'h', wt-(48*wt),       'c', wt-(7*wt), 0   ,  wt-(7*wt),-10*ht,  0   ,-10*ht,                                    'z',
        'M',xt+ wt-(72*wt),yt+217*ht,'l',   wt-(18*wt),19*ht,'c', wt-(5*wt),5*ht,wt-(12*wt),-3*ht, wt-(8*wt),-7*ht,                                   'l',wt-(-19*wt),-19*ht,'c',wt-(-5*wt),-4*ht,wt-(-12*wt),  3*ht, wt-(-7*wt),  7*ht,                                    'z',
        'M',xt+wt-(127*wt),yt+172*ht,'v',      (49*ht),      'c', 0   ,6*ht,wt-(10*wt), 6*ht,wt-(10*wt), 0*ht,                                   'v',(-49*ht),       'c', 0   ,-7*ht,wt-(-10*wt), -7*ht,wt-(-10*wt),  0   ,                                    'z',
        'M',xt+wt-(201*wt),yt+194*ht,'l',  wt-(-34*wt),35*ht,'c',wt-(-5*wt),4*ht, wt-(2*wt),12*ht, wt-(7*wt), 7*ht,                                   'l', wt-(34*wt),-35*ht,'c', wt-(5*wt),-4*ht, wt-(-2*wt),-11*ht, wt-(-7*wt), -7*ht,                                    'z',
        'M',xt+wt-(195*wt),yt+239*ht,'l',  wt-(-14*wt), 5*ht,'c',wt-(-2*wt),1*ht,wt-(-4*wt), 4*ht,wt-(-3*wt), 7*ht,0   , 2*ht, wt-(3*wt), 4*ht, wt-(6*wt), 3*ht,'l', wt-(14*wt), -6*ht,'c', wt-(2*wt),-1*ht,  wt-(4*wt), -3*ht,  wt-(3*wt), -6*ht, 0   ,-2*ht,wt-(-3*wt),-4*ht,wt-(-6*wt),-3*ht,'z',
        'M',xt+wt-(154*wt),yt+206*ht,'l',   wt-(-6*wt),14*ht,'c',wt-(-1*wt),3*ht, wt-(1*wt), 6*ht, wt-(4*wt), 6*ht,wt-(2*wt), 1*ht, wt-(5*wt),-1*ht, wt-(6*wt),-3*ht,'l',  wt-(5*wt),-14*ht,'c', wt-(1*wt),-2*ht, wt-(-1*wt), -5*ht, wt-(-3*wt), -6*ht,wt-(-3*wt),-1*ht,wt-(-5*wt), 1*ht,wt-(-6*wt), 3*ht,'z',
        'M',xt+wt-(101*wt),yt+209*ht,'l',    wt-(6*wt),14*ht,'c', wt-(1*wt),2*ht, wt-(3*wt), 4*ht, wt-(6*wt), 3*ht,wt-(3*wt), 0   , wt-(5*wt),-3*ht, wt-(4*wt),-6*ht,'l', wt-(-6*wt),-14*ht,'c',wt-(-1*wt),-2*ht, wt-(-3*wt), -4*ht, wt-(-6*wt), -3*ht,                                    's',wt-(-5*wt),4*ht,wt-(-4*wt),6*ht,'z',
        'M',xt+wt-(286*wt),yt+281*ht,'H',xt+wt-(75*wt),      'c',wt-(-7*wt),0   ,wt-(-7*wt),10*ht, 0   ,10*ht,                                   'h',wt-(211*wt),       'c', wt-(7*wt), 0   ,  wt-(7*wt),-10*ht,  wt-(0*wt),-10*ht,                                    'z',
        'M',xt+ wt-(74*wt),yt+252*ht,'l',    wt-(8*wt), 4*ht,'c', wt-(2*wt),1*ht, wt-(5*wt),-1*ht, wt-(6*wt),-4*ht,0   ,-3*ht,wt-(-1*wt),-5*ht,wt-(-4*wt),-6*ht,'l', wt-(-8*wt), -3*ht,'c',wt-(-2*wt),-1*ht, wt-(-5*wt),  1*ht, wt-(-6*wt),  3*ht,wt-(-1*wt), 3*ht, wt-(1*wt), 5*ht, wt-(4*wt), 6*ht,'z',
        'M',xt+ wt-(94*wt),yt+280*ht,'v',     (-29*ht),      'c', 0   ,-11*ht,wt-(9*wt),-20*ht,wt-(20*wt),-20*ht,                                'h', wt-(35*wt),       'c',wt-(11*wt), 0   , wt-(20*wt),  9*ht, wt-(20*wt), 20*ht,                                    'v',29*ht
      ];
    };
    if (Highcharts.VMLRenderer) {
      Highcharts.VMLRenderer.prototype.symbols.sunrise = Highcharts.SVGRenderer.prototype.symbols.sunrise;
      Highcharts.VMLRenderer.prototype.symbols.sunset = Highcharts.SVGRenderer.prototype.symbols.sunset;
    }

    // draw the plot
    var chart = this.element.highcharts({
	  chart: { styledMode: true },
      title: { text: this.options.headline },
      legend: false,
      series: [
        { // active
          name: 'active',
          id: 'active',
          zIndex: 9,
          className: 'uzsu-active',
        },
        { // inactive
          name: 'inactive',
          id: 'inactive',
          zIndex: 8,
          className: 'uzsu-inactive',
          lineWidth: 0,
          type: 'scatter'
        },
        { // sun min/max
          id: 'range',
          zIndex: 2,
          className: 'uzsu-minmax',
          type: 'scatter',
          lineWidth: 2,
          draggableY: false,
          tooltip: {
            headerFormat: '',
            footerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
            pointFormatter: function() { return '<span style="font-size: 10px">'+this.series.chart.time.dateFormat('%a, %H:%M', this.x)+'</span><br/>'; },
          },
          point: {
            events: {
              drop: function (e) {
                self.justDragged = true; // used to prevent click event after
											// drop
                var time = self.element.highcharts().time.dateFormat('%H:%M', e.target.x);
                if(e.target.className == 'uzsu-min')
                  e.target.uzsuEntry.timeMin = time;
                else if(e.target.className == 'uzsu-max')
                  e.target.uzsuEntry.timeMax = time;
                self._save();
              },
              click: null
            }
          },
        },
        { // sunrise & sunset
          name: 'sun',
          id: 'sun',
          zIndex: 1,
          type: 'scatter',
          tooltip: {
            headerFormat: '',
            footerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
            pointFormatter: function() { return '<span style="font-size: 10px">'+this.series.chart.time.dateFormat('%a, %H:%M', this.x)+'</span><br/>'; },
          },
          marker: {
            radius: 16
          },
          draggableY: false,
          point: {
            events: {
              drop: function (e) {
                self.sunTimes[e.target.uzsuEvent] = self.element.highcharts().time.dateFormat('%H:%M', e.target.x);
                self._delay(function() { self.draw() }, 10); // redraw has to
																// be deferred
																// otherwise
																// highcharts
																// draggable
																// plugin throws
																// an exception
              },
              click: null
            }
          }
        }
      ],
      xAxis: {
        type: 'datetime',
        min: this._startTimestamp,
        max: 1000*60*60*24 + this._startTimestamp,
        showLastLabel: false,
        crosshair: { snap: false },
        dateTimeLabelFormats: {
          day: '%a'
        }
      },
      yAxis: {
        title: false,
        endOnTick: false,
        startOnTick: false,
        alignTicks: true,
        crosshair: { snap: false },
        minTickInterval: 1,
        tickInterval: this.options.valuetype === 'bool' ? 1 : null,
        min: min,
        max: max,
        type: this.options.valuetype === 'bool' ? 'category' : 'linear',
        categories: this.options.valuetype === 'bool' ? [ valueParameterList[1].split(':')[0], valueParameterList[0].split(':')[0] ] : null
      },
      tooltip: {
        xDateFormat: '%a, %H:%M',
        headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
        pointFormatter: function() {
          var value = (this.series.yAxis.categories) ? this.series.yAxis.categories[this.y] : this.y;
          return '<span class="highcharts-strong">' + value + '</span> (' + this.series.name + ')<br/>';
        }

      },
      chart: {
        events: {
          click: function(e) { // add point
            if(self.justDragged) { // prevent click event after drop
              self.justDragged = false;
              return;
            }

            // find timestamp of first point and round it to minimal time step
            var firstX = Math.round((e.xAxis[0].value - e.xAxis[0].axis.min) % (1000*60*60*24) / (timeStep)) * timeStep + e.xAxis[0].axis.min;

            // round and limit value
            var yValue = e.yAxis[0].value;
            if(yValue < min)
              yValue = min;
            else if(yValue > max)
              yValue = max;
            yValue = Math.round((yValue - min) / step) * step + min;

            var uzsuEntry = { active: true, event: 'time', timeCron: self.element.highcharts().time.dateFormat('%H:%M', firstX), value: yValue };
            self._uzsuRuntimePopup(uzsuEntry);

          }
        }
      },
      plotOptions: {
        series: {
			dragDrop : {
				draggableX: this.options.editable,
				dragPrecisionX: timeStep,
				draggableY: this.options.editable,
				dragPrecisionY: step,
				dragMinY: min,
				dragMaxY: max
		  },
          cursor: this.options.editable ? 'move' : null,
          marker: { enabled: true },
          stickyTracking: false,
          findNearestPointBy: 'xy',
          type: 'scatter',
          lineWidth: 2,
          point: {
            events: {
              click: function (e) {
                if(self.justDragged) { // prevent click event after drop
                  self.justDragged = false;
                  return;
                }
                self._uzsuRuntimePopup(e.point.uzsuEntry)
              },
              drag: function (e) {
              },
              drop: function (e) {
                self.justDragged = true; // used to prevent click event after
											// drop
                if(e.target.uzsuEntry !== undefined) {
                  e.target.uzsuEntry.value = e.target.y;
                  if(e.target.uzsuEntry.event == 'time')
                    e.target.uzsuEntry.timeCron = self.element.highcharts().time.dateFormat('%H:%M', e.target.x);
                  else // sunrise or sunset
                    e.target.uzsuEntry.timeOffset = Math.round(((e.target.x % (1000*60*60*24)) - (self._getSunTime(e.target.uzsuEntry.event) % (1000*60*60*24)))/1000/60);
                  // uzsuEntry.active
                  self._save();
                }
              }
            }
          }
        }
      },
    },
    function (chart) {

      // crosshair tooltip
      self.element.mousemove(function (e) {
        if (!chart.lab) {
          chart.lab = chart.renderer.text('', 0, 0)
          .attr({ zIndex: 10 })
          .addClass('highcharts-axis-labels')
          .add();
        }

        e = chart.pointer.normalize(e);
        var position = {
          x: chart.xAxis[0].toValue(e.chartX),
          y: chart.yAxis[0].toValue(e.chartY)
        };


        position.x = Math.round((position.x - self._startTimestamp) % (1000*60*60*24) / (timeStep)) * timeStep + self._startTimestamp;
        if(position.y < min)
          position.y = min;
        else if(position.y > max)
          position.y = max;
        position.y = Math.round((position.y - min) / step) * step + min;
        if(chart.yAxis[0].categories)
          position.y = chart.yAxis[0].categories[position.y];

        chart.lab.attr({
          x: e.chartX + 5,
          y: e.chartY - 22,
          text: self.element.highcharts().time.dateFormat('%H:%M', position.x) + '<br>' + position.y
        });
      });

      self.element.mouseout(function () {
        if (chart && chart.lab) {
            chart.lab.destroy();
            chart.lab = null;
        }
      });

      // active/inactive button
      chart.renderer.button(String.fromCharCode(160)+String.fromCharCode(10004)+String.fromCharCode(160), chart.plotLeft, null, function(e) { self._uzsudata.active = !self._uzsudata.active; self._save(); }, null,  null,  null,  null, 'callout')
        .attr({
          align: 'right',
          title: sv_lang.uzsu.active
        })
        .addClass('highcharts-color-0 uzsu-active-toggler')
        // .css({'fill': 'transparent'})
        .add()
        // .align({
        // align: 'right',
        // x: -16-(buttons.length-i-1)*20,
        // y: 10
        // }, false, null);

      // Interpolation buttons
      self.interpolationButtons = [
        { interpolationType: 'none', shape: 'square', langKey: 'nointerpolation' },
        { interpolationType: 'cubic', shape: 'circle', langKey: 'cubic' },
        { interpolationType: 'linear', shape: 'triangle', langKey: 'linear' },
      ];

      $.each(self.interpolationButtons, function(i, button) {
        button.element = chart.renderer.button('', null, null, function(e) { self._uzsudata.interpolation.type = button.interpolationType; self._save(); }, null,  null,  null,  null, button.shape)
          .attr({
            align: 'right',
            title: sv_lang.uzsu[button.langKey],
            "data-interpolation-type": button.interpolationType
          })
          .addClass('icon0 interpolation-button')
          .css({'fill': 'transparent'})
          .add()
          .align({
            align: 'right',
            x: -16-(self.interpolationButtons.length-i-1)*20,
            y: 10
          }, false, null);
      });

      chart.renderer.text(sv_lang.uzsu.interpolation+': ', null, null)
        .attr({
          align: 'right'}
        )
        .add(
          chart.renderer.createElement('g').addClass('highcharts-label').add()
        )
        .align({
          align: 'right',
          x: -16-self.interpolationButtons.length*20,
          y: 22
        }, false, null);
    });
  },

  _update: function(response) {
    this._super(response);

    if(this._uzsuParseAndCheckResponse(this._uzsudata))
      this.draw();
  },

  draw: function() {
    var self = this;
    var chart = this.element.highcharts();

    if(this._uzsudata.active)
      this.element.removeClass('uzsu-all-inactive');
    else
      this.element.addClass('uzsu-all-inactive');

    var hasDays = false;
    var hasSunrise = false;
    var hasSunset = false;
    var seriesData = { active: [], inactive: [], range: [] };
    var linetype = this._uzsudata.interpolation.type == 'cubic' ? 'spline' : 'line';
    Highcharts.seriesTypes.scatter.prototype.getPointSpline = Highcharts.seriesTypes[linetype].prototype.getPointSpline;
    $.each(this._uzsudata.list, function(responseEntryIdx, responseEntry) {
      // in der Tabelle die Werte der rrule, dabei gehe ich von dem
		// Standardformat FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU aus und setze
		// f??r jeden Eintrag den Button.
      var x, xMin, xMax;
      if(responseEntry.event == 'time')
        x = self._timeToTimestamp(responseEntry.timeCron);
      else {
        if(responseEntry.event == 'sunrise')
          hasSunrise = true;
        else if(responseEntry.event == 'sunset')
          hasSunset = true;
        x = self._getSunTime(responseEntry.event);
        if(responseEntry.timeOffsetType == 'm')
          x += responseEntry.timeOffset*1000*60;
        else if(responseEntry.timeOffsetType == '' && responseEntry.timeOffset != '')
          x = (responseEntry.calculated == undefined) ? x : self._timeToTimestamp(responseEntry.calculated);
          console.log('Set '+ responseEntry.event +' based entry to calculated time ' +
          responseEntry.calculated + ' for ' + responseEntry.timeCron);
        if(responseEntry.timeMin) {
          xMin = self._timeToTimestamp(responseEntry.timeMin);
          if(x < xMin)
            x = xMin;
        }
        if(responseEntry.timeMax) {
          xMax = self._timeToTimestamp(responseEntry.timeMax);
          if(x > xMax)
            x = xMax;
        }
      }

      var rrule = responseEntry.rrule;
      if (!rrule)
        rrule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU';
      var ind = rrule.indexOf('BYDAY=');
      // wenn der Standard drin ist
      if (ind > 0) {
        var days = rrule.substring(ind+6).split(',');
        if (days.length < 7)
          hasDays = true;
        $.each(days, function(dayIdx, day) {
          var rruleOffset = self.rruleDays[day]*1000*60*60*24;
          var xRecurring = x + rruleOffset;
          var yValue = Number(responseEntry.value);
          seriesData[responseEntry.active ? 'active' : 'inactive'].push({ x: xRecurring, y: yValue, className: 'uzsu-'+responseEntryIdx+' uzsu-event-'+responseEntry.event, entryIndex: responseEntryIdx, uzsuEntry: responseEntry });
          if(xMin !== undefined || xMax !== undefined) {
            if(xMin !== undefined)
              seriesData.range.push({ x: xMin+rruleOffset, y: yValue, name: sv_lang.uzsu.earliest, uzsuEntry: responseEntry, className: 'uzsu-min' });
            else
              seriesData.range.push({ x: xRecurring, y: yValue, uzsuEntry: responseEntry, className: 'uzsu-min uzsu-hidden', marker: { enabled: false } });
            if(xMax !== undefined)
              seriesData.range.push({ x: xMax+rruleOffset, y: yValue, name: sv_lang.uzsu.latest, uzsuEntry: responseEntry, className: 'uzsu-max' });
            else
              seriesData.range.push({ x: xRecurring, y: yValue, uzsuEntry: responseEntry, className: 'uzsu-max uzsu-hidden', marker: { enabled: false } });
            seriesData.range.push({ x: xMax+rruleOffset+1, y: null, uzsuEntry: responseEntry });
          }
        });
      }
    });

    var xMax = 1000*60*60*24 * (hasDays ? 7 : 1) + this._startTimestamp;

    // active points
    var data = seriesData.active;
    data.sort(function(a,b) { return a.x - b.x });
    if(data.length > 0) {
      data.unshift({ x: data[data.length-1].x-1000*60*60*24*7, y: data[data.length-1].y, className: data[data.length-1].className });
      data.push({ x: data[1].x+1000*60*60*24*7, y: data[1].y, className: data[1].className });
    }

    chart.get('active').setData(data, false, null, false);
    chart.get('active').update({
      type: 'scatter',
      step: this._uzsudata.interpolation.type != 'cubic' && this._uzsudata.interpolation.type != 'linear' ? 'left' : false,
    }, false);

    // inactive points
    data = seriesData.inactive;
    data.sort(function(a,b) { return a.x - b.x });
    chart.get('inactive').setData(data, false, null, false);

    // min/max times on sun events
    chart.get('range').setData(seriesData.range, false, null, false);

    plotLines = [];
    sunData = [];
    if(hasSunrise || hasSunset) {
      for(dayIdx = 0; dayIdx < 7; dayIdx++) {
        if(hasSunrise) {
          plotLines.push({
            value: self._getSunTime('sunrise')+dayIdx*1000*60*60*24,
            className: 'uzsu-event-sunrise',
            label: { text: sv_lang.uzsu.sunrise }
          });
          sunData.push({ x: self._getSunTime('sunrise')+dayIdx*1000*60*60*24, y: chart.yAxis[0].min, name: sv_lang.uzsu.sunrise, className: 'uzsu-event-sunrise', uzsuEvent: 'sunrise', marker: { symbol: 'sunrise' } });
        }
        if(hasSunset) {
          plotLines.push({
            value: self._getSunTime('sunset')+dayIdx*1000*60*60*24,
            className: 'uzsu-event-sunset',
            label: { text: sv_lang.uzsu.sunset }
          });
          sunData.push({ x: self._getSunTime('sunset')+dayIdx*1000*60*60*24, y: chart.yAxis[0].min, name: sv_lang.uzsu.sunset, className: 'uzsu-event-sunset', uzsuEvent: 'sunset', marker: { symbol: 'sunset' } })
        }
      }
    }
    chart.xAxis[0].update({
      max: 1000*60*60*24 * (hasDays ? 7 : 1) + this._startTimestamp,
      plotLines: plotLines
    }, false);
    chart.get('sun').setData(sunData, false);

    // set active interpolation button
    $.each(this.interpolationButtons, function(idx, button) {
      if(button.interpolationType == self._uzsudata.interpolation.type)
        button.element.addClass("icon1");
      else
        button.element.removeClass("icon1");
    });

    chart.redraw();

    self._plotNowLine();
    Highcharts.seriesTypes.scatter.prototype.getPointSpline = Highcharts.seriesTypes.line.prototype.getPointSpline;
  },

  _save: function() {
    this._uzsuCollapseTimestring(this._uzsudata);
    this._write(this._uzsudata);
    this._delay(function() { this.draw() }, 1); // has to be delayed to prevent
												// exception in highcharts
												// draggable points
  },

  _timeToTimestamp: function(time) {
    return new Date('1970-01-01T' + time + 'Z').getTime() + this._startTimestamp;
  },

  _getSunTime: function(event) {
    if(!this.sunTimes)
      this.sunTimes = { 'sunrise': (this._uzsudata.sunrise == undefined) ? '06:00' : this._uzsudata.sunrise, 'sunset': (this._uzsudata.sunset == undefined) ? '19:30' : this._uzsudata.sunset };
    return this._timeToTimestamp(this.sunTimes[event]);
  },

  _plotNowLine: function(id) {
    if(this._nowLinePlotDelay) {
      clearTimeout(this._nowLinePlotDelay);
      this._nowLinePlotDelay = null;
    }

    var axis = this.element.highcharts().xAxis[0];
    axis.removePlotLine('now');
    axis.addPlotLine({
      id: 'now',
      value: (this._timeToTimestamp(String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0')) - this._startTimestamp + 1000*60*60*24*((new Date().getDay() + 6) % 7)) % (axis.max - this._startTimestamp) + this._startTimestamp,
      className: 'uzsu-now highcharts-color-0',
      label: 'now'
    });

    this._nowLinePlotDelay = this._delay(function() {
      this._plotNowLine(this._nowLinePlotDelay);
    }, 60000);
  },

  _uzsuRuntimePopup: function(responseEntry) {
    var self = this;
    // Steuerung des Popups erst einmal wird der Leeranteil angelegt
    // erst den Header, dann die Zeilen, dann den Footer
    var tt = this._uzsuBuildTableHeader();
    tt += this._uzsuBuildTableRow(0);
    tt += this._uzsuBuildTableFooter();
    // dann h??ngen wir das an die aktuelle Seite
    var uzsuPopup = $(tt).appendTo(this.element).enhanceWithin().popup().on({
      popupbeforeposition: function(ev, ui) {
        var maxHeight = $(window).height() - 230;
        $(this).find('.uzsuTableMain').css('max-height', maxHeight + 'px').css('overflow-y','auto').css('overflow-x','hidden');
      },
      popupafteropen: function(ev, ui) {
        $(this).popup('reposition', {y: 30})
      },
      popupafterclose: function(ev, ui) {
        $(this).remove();
        $(window).off('resize', self._onresize);
      }
    });
    // dann speichern wir uns f??r cancel die urspr??nglichen im DOM gespeicherten
	// Werte in eine Variable ab
    var responseCancel = jQuery.extend(true, {}, responseEntry);
    // dann die Werte eintragen.
    var tableRow = $('.uzsuRow').first();
    this._uzsuFillTableRow(responseEntry, tableRow);
    // Verhindern negativer Zahleneingabe
    $('.positivenumbers').keypress(function(evt){
        var charCode = (evt.which) ? evt.which : event.keyCode;
        return !(charCode > 31 && (charCode < 48 || charCode > 57));
    });
    // Popup schliessen mit close rechts oben in der Box oder mit Cancel in der
	// Leiste
    uzsuPopup.find('#uzsuClose, #uzsuCancel').bind('click', function(e) {
      // wenn keine ??nderungen gemacht werden sollen (cancel), dann auch im
		// cache die alten Werte
      uzsuPopup.popup('close');
    });

    // speichern mit SaveQuit
    uzsuPopup.find('#uzsuSaveQuit').bind('click', function(e) {
      // jetzt wird die Kopie auf das Original kopiert und geschlossen
      self._uzsuSaveTableRow(responseEntry, tableRow);
      // add entry if it is a new one
      if(self._uzsudata.list.indexOf(responseEntry) == -1)
        self._uzsudata.list.push(responseEntry);
      self._save();
      uzsuPopup.popup('close');
    });
    // L??schen mit del als Callback eintragen
    uzsuPopup.delegate('.uzsuDelTableRow', 'click', function(e) {
      var entryIndex = self._uzsudata.list.indexOf(responseEntry);
      if(entryIndex != -1) { // don't remove if it was a new entry which is
								// not in list yet
        self._uzsudata.list.splice(entryIndex, 1);
        self._save();
      }
      uzsuPopup.popup('close');
    });
    // call Expert Mode
    uzsuPopup.delegate('.uzsuCellExpert button', 'click', function(e) {
      if($(this).hasClass('ui-icon-arrow-u'))
        self._uzsuHideAllExpertLines();
      else
        self._uzsuShowExpertLine(e);
    });
    // Handler, um den expert button Status zu setzen
    uzsuPopup.delegate('input.expertActive', 'change', function (){
      self._uzsuSetExpertColor($(this));
    });
    // Handler, um den Status anhand des Pulldowns SUN zu setzen
    uzsuPopup.delegate('.uzsuRowExpert .uzsuEvent select, input.uzsuSunActive', 'change', function (){
      self._uzsuSetSunActiveState($(this));
    });

    // hier wir die aktuelle Seite danach durchsucht, wo das Popup ist und im
	// folgenden das Popup initialisiert, ge??ffnet und die schliessen
    // Funktion daran gebunden. Diese entfernt wieder das Popup aus dem DOM Baum
	// nach dem Schliessen mit remove
    uzsuPopup.popup('open');
  },

  _uzsuBuildTableFooter: function() {
    var tt = "";
    // Zeileneintr??ge abschliessen und damit die uzsuTableMain
    tt += "</div>";
    // Aufbau des Footers
      tt += "<div class='uzsuTableFooter'>" +
          "<div class='uzsuRowFooter'>" +
              "<div class='uzsuCell' style='float: right'>" +
                  "<div data-role='controlgroup' data-type='horizontal' data-inline='true' data-mini='true'>" +
                    "<button id='uzsuCancel'>" + sv_lang.uzsu.cancel + "</button>" +
                    "<button id='uzsuSaveQuit'>" + sv_lang.uzsu.ok + "</button>" +
                  "</div>" +
                "</div>" +
              "</div>" +
            "</span>" +
          "</div>";
    // und der Abschluss des uzsuClear als Rahmen f??r den float:left und des
	// uzsuPopup divs
    tt += "</div></div>";
    return tt;
  },

});

// *****************************************************
// Widget for UZSU-timetable
// *****************************************************
//
// Neugestaltetes UZSU Widget zur Bedienung UZSU Plugin in Form einer Tabelle
//
// Darstellung der UZSU Eintr??ge und Darstellung des Widgets in Form einer
// Tabelle
// Umsetzung
// (C) Andre Kohler 2020
//
// license GPL [http://www.gnu.de]
//

$.widget("sv.device_uzsutable", $.sv.widget, {

	initSelector : 'div[data-widget="device.uzsutable"]',
	options :
	 {
	   'val-on'    		: null,
	   'val-off'   		: null,
	   'color-on'  		: null,
	   'color-off' 		: null,
	   'fill'      		: null,	   
	   'color-on-disabled'	: null,
 	   'color-off-disabled'	: null,
	   'borderstyle' 	: null,
	   'granularity'	: null,
	   'showtooltip'	: null,
	   'showsun'		: null,
	   'showactualtime'	: null,
     'designtype'		: null,
	   'valuetype'		: 'bool',
     'valueparameterlist'	: null,
     'headline'		: '',
     'showzoombutton'	: '',
     'inactivestyle'	: 1,
	   'mySvgWidth'		: 0

	 },
 	_create: function()
 	 {
	  this._super();

          this.options.designtype = String(this.options.designtype);
    	  if(this.options.designtype === undefined || this.options.designtype === '')
    	   {
	     this.options.designtype = io.uzsu_type;
	   }
	 },
	_update : function(response)
	{
 	 console.log("got update of Item")
	 this._super(response);
	 this._uzsudata = jQuery.extend(true, {}, response[0]);
	 this._DrawTimeTable(this.uuid,this.options,this._uzsudata)
	 // Function to keep Data actual
	 this._CalcTimeLine(this)



	},
	_events: {
	'click': function (event) {
		console.log("Click Event")
		myTarget = event.target.id
		if (myTarget == "")
		 { myTarget = event.target.closest("svg").id }
		switch (myTarget)
		 {
		 case  '5m' : {	this.options.granularity = "5m";this._DrawTimeTable(this.uuid,this.options,this._uzsudata);break }
		 case '10m' : {	this.options.granularity = "10m";this._DrawTimeTable(this.uuid,this.options,this._uzsudata);break }
 		 case '15m' : {	this.options.granularity = "15m";this._DrawTimeTable(this.uuid,this.options,this._uzsudata);break }
 		 case '30m' : {	this.options.granularity = "30m";this._DrawTimeTable(this.uuid,this.options,this._uzsudata);break } 		 
 		 case '1h' : {	this.options.granularity = "1h";this._DrawTimeTable(this.uuid,this.options,this._uzsudata);break }
  		 case 'btnActive' :
  		 		{
				if (event.bubbles === true)
  		 		{
  		 		this._uzsudata.active = !this._uzsudata.active
  		 		this._write(this._uzsudata)
				event.bubbles = false
				break;
				}
  		 		}
  		 default : {
			      // ??ffnen des Popups bei clicken des icons und Ausf??hrung
					// der Eingabefunktion
			      var response = jQuery.extend(true, {}, this._uzsudata);
			      if (this._uzsuParseAndCheckResponse(response)) {
				this._uzsuRuntimePopup(response);

			      }

		  	   }
		 }

		
	 }
	},

	// *****************************************************
	// function for drawing the time-table
	// *****************************************************
	_DrawTimeTable: function (TableName,options, myDict) {
		var	myJson = {}
		var myBorderStyle = ''
		myOptions = $.extend(true, [], options);
		if (myOptions.borderstyle.explode().length == 1)
		{
			myJson[myOptions['granularity']] = myOptions.borderstyle.explode()[0]
		}
		else 
		{
			for (key in myOptions.borderstyle.explode())
			{  myJson[myOptions.borderstyle.explode()[key].split(":")[0]]=myOptions.borderstyle.explode()[key].split(":")[1]}
			if (myJson[myOptions['granularity']] != undefined)
				{
					myBorderStyle = myJson[myOptions['granularity']]
				}
			else
				{
					myBorderStyle = 'solid'
				}
			
		}

		switch (myBorderStyle)
		{
		 case 'hourly':
		 {
		   myBorder = 0.0
		   overlayFill = 0.2
		   break;
		 }
		 case 'solid':
		 {
		   myBorder = 0.2
		   overlayFill = 0
		   break;
		 }
		 case 'horizontal':
		 {
	   	   myBorder = 0
		   overlayFill = 0.2	   	   
		   break;	   
		 }	
		 case 'none':
		 {
		   myBorder = 0	   
		   overlayFill = 0		   
		   break;	   
		 }	 
		 default :
		 {
		   myBorder = 0.2
		   overlayFill = 0		   	   
	   	   break;
		 }
		}
		switch (myOptions['granularity'])
		{
		case '5m':
		{
			round = 2.5
			nextValue = 5
			myColSpan = 12
			break;
		}
		case '10m':
		{
			round = 5
			nextValue = 10
			myColSpan = 6
			break;
		}
		case '15m':
		{
			round = 7.5
			nextValue = 15
			myColSpan = 4		
			break;
		}
		case '30m':
		{
			round = 15
			nextValue = 30
			myColSpan = 2
			break;
		}
		case '1h':
		{
			round = 30
			nextValue = 60
			myColSpan = 1		
			break;
		}
		default :
		{
			round = 30
			nextValue = 60
			myColSpan = 1		
			break;	
		}
		}

		if (sv_lang.uzsu.th = 'Do')		// Check language
		  {
  		   var myDays = [ "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So" ]
  		   txtActive='inaktiv'
		  }
		else
		  {
				 var myDays = [ "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su" ]
				 txtActive = 'Inactive'
		  }
		var preFix = TableName
		var HeadlineHeight = 40
		// get sunrise and sunset
		sunrise = myDict.sunrise
		sunset  = myDict.sunset
		weekDays = {'MO' : "0" ,'TU' : "1" ,'WE' : "2" ,'TH' : "3",'FR' : "4",'SA' : "5" ,'SU' : "6" }

		d = 0

		// Clear the SVG
		tbl2Delete=[]
		this.element.find("svg")[0].childNodes.forEach(function(element){tbl2Delete.push(element)})
		while (tbl2Delete.length>0) 
		{
		 myEntry = tbl2Delete.pop()
		 myEntry.remove()
		}
		

		this.options.mySvgWidth=400
		this.element.find("svg")[0].width.baseVal.value = this.options.mySvgWidth
		offset = this.options.mySvgWidth/25

		// Set the viewbox
		this.element.find("svg")[0].viewBox.baseVal.width = this.options.mySvgWidth+2 // viewWidth
		this.element.find("svg")[0].setAttribute('width','100%')

		// add the Headline to Svg

		if (this.options.headline != '')
		 { 
		   var tblHeadline = document.createElementNS("http://www.w3.org/2000/svg", 'text'); // Create
																								// a
																								// text
																								// in
																								// SVG's
																								// namespace
		   tblHeadline.setAttribute("style", 'text-anchor:middle; font-size:14px')
		   tblHeadline.setAttributeNS(null, 'x', this.options.mySvgWidth/2);
		   tblHeadline.setAttributeNS(null, 'y', 29);  
		   tblHeadline.setAttribute("id", "tblHeadline");        		
		   tblHeadline.setAttributeNS(null, 'width',this.options.mySvgWidth-40 );    
		   tblHeadline.classList.add("highcharts-title")
		   tblHeadline.innerHTML=this.options.headline
		   this.element.find("svg")[0].appendChild(tblHeadline)
		 }
		 
		tblHeader=[]
		h = 0
		while (h <= 23) {
			tblHeader[h]=this._CreateSvgBox1("0.5")
			tblHeader[h].setAttributeNS(null, 'x', offset+offset*h);
			tblHeader[h].setAttributeNS(null, 'y', 0+HeadlineHeight);  
			tblHeader[h].setAttribute("id", "tblHeader-"+h);
			tblHeader[h].childNodes[1].classList.add("highcharts-title")	 
			tblHeader[h].childNodes[1].innerHTML=String("00"+h).slice(-2)
			this.element.find("svg")[0].appendChild(tblHeader[h])
			h += 1
		}	
		
		if ( myOptions.showsun == true)
		{
		// add the sun-Header to Svg
		tblHeader[99]=this._CreateSvgBox1("0.5")
		tblHeader[99].setAttributeNS(null, 'x', offset);
		tblHeader[99].setAttributeNS(null, 'y', 12+HeadlineHeight);
		tblHeader[99].setAttributeNS(null, 'width',this.options.mySvgWidth/25*24 );    
		tblHeader[99].childNodes[0].setAttributeNS(null, 'width',this.options.mySvgWidth/25*24 );    
		tblHeader[99].setAttribute("id", "tblHeader-99");        		
		this.element.find("svg")[0].appendChild(tblHeader[99])
		}

		while (d <= 6) {

			tblHeader[d+50]=this._CreateSvgBox1("0.5")
			tblHeader[d+50].setAttributeNS(null, 'x', 0);
			tblHeader[d+50].setAttributeNS(null, 'y', (12*myOptions.showsun)+12+d*12+HeadlineHeight);  
			tblHeader[d+50].setAttribute("id", "tblHeader-"+(50+d));        		
      tblHeader[d+50].childNodes[1].classList.add("highcharts-title")	 
			tblHeader[d+50].childNodes[1].innerHTML=myDays[d]
			this.element.find("svg")[0].appendChild(tblHeader[d+50])
			
			h = 0
			while (h <= 23) {
				m = 0
				minutes = 0
				while (m <= myColSpan-1)
				{
				minutes = m * nextValue

				// *******************************
				tblHeader[(d+1)*h+m]=this._CreateSvgBox2(myBorder, overlayFill)
				tblHeader[(d+1)*h+m].setAttributeNS(null, 'x', offset+h*offset+m*offset/myColSpan);
				tblHeader[(d+1)*h+m].setAttributeNS(null, 'y', (12*myOptions.showsun)+12+d*12+HeadlineHeight);  
				tblHeader[(d+1)*h+m].colspan = myColSpan;
				tblHeader[(d+1)*h+m].setAttribute("id", 'svg-'+preFix
						+ "-"
						+ String("00"+d).slice(-2)
						+ "-"
						+ String("00"+h).slice(-2)
						+ "-"
						+ String("00"+minutes).slice(-2) );        		

				this.element.find("svg")[0].appendChild(tblHeader[(d+1)*h+m])			
				// *********************************
				m++
				}
				h += 1
			}

			d += 1
		}

		// Set Lines if horizontal
		if (myBorderStyle=='horizontal' || myBorderStyle=='hourly')
		{
		myLines = []
		l=0
		while (l <= 6)
		{
		  myLines[l]=this._CreateSvgLine('0.5')
		  myLines[l].setAttributeNS(null, 'x1', offset);
  	  myLines[l].setAttributeNS(null, 'x2', offset*25);
		  myLines[l].setAttributeNS(null, 'y1', (12*myOptions.showsun)+12+12+l*12+HeadlineHeight);
  	  myLines[l].setAttributeNS(null, 'y2', (12*myOptions.showsun)+12+12+l*12+HeadlineHeight);    
		  this.element.find("svg")[0].appendChild(myLines[l])				  
		  l++
		}
		}
				// Set Lines if 1h
		if ( myBorderStyle=='hourly')
		{
		myVertLines = []
		l=1
		while (l <= 23)
		{
		  myVertLines[l]=this._CreateSvgLine('0.5')
		  myVertLines[l].setAttributeNS(null, 'x1', offset*l+offset);
  	  myVertLines[l].setAttributeNS(null, 'x2', offset*l+offset);
		  myVertLines[l].setAttributeNS(null, 'y1', (12*myOptions.showsun)+12+HeadlineHeight);
  	  myVertLines[l].setAttributeNS(null, 'y2', (12*myOptions.showsun)+12+12+72+HeadlineHeight);    
		  this.element.find("svg")[0].appendChild(myVertLines[l])				  
		  l++
		}
		}
		// Set the different modes for inactive UZSU
		// Set the opacity based on active or not active
		if (this.options.inactivestyle & 1)
		{
		 myDict.active == false ? this.element.find("svg")[0].style.opacity=0.5 : this.element.find("svg")[0].style.opacity=1.0	
		}
		if (myDict.active == false && this.options.inactivestyle & 2)
		{
		  myInActiveText=this._CreateSvgText(txtActive)
		  myInActiveText.setAttributeNS(null, 'y','40px')
		  myInActiveText.classList.add("highcharts-title")	 
		  myInActiveText.setAttributeNS(null, 'style','transform: rotate(20deg); font-weight:bold; fill:lightgrey; font-size:3em; stroke-width:0.5; stroke:black; font-family:Monospace; text-anchor:middle')		
		  myInActiveText.setAttributeNS(null, 'x',this.options.mySvgWidth/2)	
		  myInActiveText.setAttributeNS(null, 'id','txtInactive')
		  this.element.find("svg")[0].appendChild(myInActiveText)		

		}
		myInstance = this
		// now get the entries
		
		for (myItem in myDict.list)
		 { console.log(myDict.list[myItem]);
		   myActItem = myDict.list[myItem]
		   myDays=[]
		   myTimeDict = []
		   try
		   { myDays = myActItem.rrule.split(";")[1].split("=")[1].split(",") }
		   catch (e)
		   {}
		   myDays.forEach(function(element) {
			 d       = weekDays[element]
			 myTime  = ''
			 if (myActItem.time.search("sunrise") == -1 && myActItem.time.search("sunset") == -1 && !(myActItem.hasOwnProperty("series")))
			 {
			 	 hours   = myActItem.time.split(":")[0]
			 	 minutes = myActItem.time.split(":")[1]
			 	 myTime = myActItem.time
			 	 myTimeDict.push({
 				    key:     myTime,
 				    minutes: minutes,
 				    hours:   hours
 				    });
			 }
			 else if (myActItem.time.search("sunrise") != -1 || myActItem.time.search("sunset") != -1)
			 {
			   if (myActItem.hasOwnProperty("calculated"))
			   {
				 hours   = myActItem.calculated.split(":")[0]
			 	 minutes = myActItem.calculated.split(":")[1]
	 		 	 myTime = myActItem.calculated
	 		 	 myTimeDict.push({
 				    key:     myTime,
 				    minutes: minutes,
 				    hours:   hours
 				    });
			   }
			   else
			   {
			    if (myActItem.time.search("sunrise") >=0)
	 		 	{
			    	hours   = sunrise.split(":")[0];
			    	minutes = sunrise.split(":")[1];
			    	myTime=sunrise
			    	myTimeDict.push({
	 				    key:     myTime,
	 				    minutes: minutes,
	 				    hours:   hours
	 				    });
			    }
	 		    if (myActItem.time.search("sunset") >=0)
	 		 	{
	 		    	hours   = sunset.split(":")[0];
	 		    	minutes = sunset.split(":")[1];
	 		    	myTime=sunset;
	 		    	myTimeDict.push({
	 				    key:     myTime,
	 				    minutes: minutes,
	 				    hours:   hours
	 				    });
	 		    }
			   }
			 }
			 else if (myActItem.hasOwnProperty("series"))
			 {
			   hours   = myActItem.series.timeSeriesMin.split(":")[0]
			   minutes = myActItem.series.timeSeriesMin.split(":")[1]
	 		   myTime  = myActItem.series.timeSeriesMin
	 		   // Intervall in minutes
	 		   IntervallMinutes    =  parseInt(myActItem.series.timeSeriesIntervall.split(":")[0])*60
	 		   IntervallMinutes   +=  parseInt(myActItem.series.timeSeriesIntervall.split(":")[1])
	 		   // max Time in Minutes
	 		   maxHours     = parseInt(myActItem.series.timeSeriesMax.split(":")[0])
	 		   maxMinutes   = parseInt(myActItem.series.timeSeriesMax.split(":")[1])
	 		   var maxTime = new Date()
			   maxTime.setMinutes(maxMinutes)
			   maxTime.setHours(maxHours)
			   maxTime.setSeconds(0)
	 		   // Create new date for Start 
			   var myNewTime = new Date()
			   myNewTime.setMinutes(minutes)
			   myNewTime.setHours(hours)
			   myNewTime.setSeconds(0)
			   
			   
	 		   while (myNewTime <= maxTime)
	 			   {
	 			  myTimeDict.push({
	 				    key:     String("00"+myNewTime.getHours()).slice(-2) + ':' + String("00"+myNewTime.getMinutes()).slice(-2),
	 				    minutes: String("00"+myNewTime.getMinutes()).slice(-2),
	 				    hours:   String("00"+myNewTime.getHours()).slice(-2)
	 				});
	 			    myNewTime.setTime(myNewTime.getTime() + IntervallMinutes*60000);
	 			   }
			 }
			 for (entry in myTimeDict)
			 {
			 myTime = myTimeDict[entry].key
			 hours  = myTimeDict[entry].hours
			 minutes = myTimeDict[entry].minutes
			 
			 round_up_down = -1
			 myOptions['val-on'] == myActItem.value ? round_up_down = -1 : round_up_down = -1
		 	 m       = (Math.round((parseInt(minutes) + (round*round_up_down))/nextValue) * nextValue) % 60;
			 h       = (m === 0 && minutes>round) ? (hours === 23 ? 0 : hours) : hours;
			 console.log("gerundete Zeit :" + String("00"+h).slice(-2) + ':'+String("00"+m).slice(-2))

			 mySvg = 'svg-' + preFix
				+ "-"
				+ String("00"+d).slice(-2)
				+ "-"
				+ String("00"+h).slice(-2)
				+ "-"
				+ String("00"+m).slice(-2)			
			mySvgCell = $('#'+mySvg)[0]
			myValue = ''
			if ( myActItem.active == true)
			{
				if (myOptions['val-on'] == myActItem.value)
				 {
		 		   myValue = 'ON'
		 		   // Now the SVG
		 			   try
		   		   {
		 				  mySvgCell.setAttributeNS(null, 'style', "stroke:black;stroke-width:"+ myBorder + "px;fill:" + myOptions['color-on'] + "; fill-opacity:1.0; pointer-events:auto;" );
		 				  mySvgCell.classList.add("ON")
		   		   }
					catch (e)
					{
						console.log('Error on updateing Cell')
					}
	   	 		   
		 		 }
				if (myOptions['val-off'] == myActItem.value)
				 {
	   	 		   myValue = 'OFF'
		 		   // Now the SVG
		   		   mySvgCell.setAttributeNS(null, 'style', "stroke:black;stroke-width:"+ myBorder + "px;fill:" + myOptions['color-off'] + "; fill-opacity:1.0; pointer-events:auto;" );
	   	 		   mySvgCell.classList.add("OFF")   	 		   
		 		 }
		 	}
		 	else
		 	{
				if (myOptions['val-on'] == myActItem.value)
				 {
		 		   myValue = 'ON'
		 		   // Now the SVG
		   		   mySvgCell.setAttributeNS(null, 'style', "stroke:black;stroke-width:"+ myBorder + "px;fill:" + myOptions['color-on-disabled'] + "; fill-opacity:1.0");
	   	 		   mySvgCell.classList.add("DISABLED_ON")	 		   	 		   
		 		 }
				if (myOptions['val-off'] == myActItem.value)
				 {
		 		   myValue = 'OFF'
		   		   mySvgCell.setAttributeNS(null, 'style', "stroke:black;stroke-width:"+ myBorder + "px;fill:" + myOptions['color-off-disabled'] + "; fill-opacity:1.0");
	   	 		   mySvgCell.classList.add("DISABLED_ON")	 		   	 		   	 		   	 		   
		 		 }	 	
		 	}
			if ( myOptions.showtooltip == true)
			 {
	 		 mySvgCell.ToolTip = ''+myTime+'- Value :'+myValue

			 }
			 }
		       })
		 }

	 	 if (this.options.showtooltip == true)
			{
			 $(".ON, .OFF, .DISABLED_OFF, .DISABLED_ON " ).hover(function(event)
			    {
				if (event.type == 'mouseenter')
				{
				console.log("General mouseover ON")	  
				/** ************************* */
			   	myObject = event.target
			   	myWidth = this.parentNode.width.animVal.value;
				offset = myWidth/25
				
		       		var newSvg  = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); // Create
																									// a
																									// svg
																									// in
																									// SVG's
																									// namespace
				// set width and height
				newSvg.setAttribute("height", "12");
				newRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); // Create
																							// a
																							// rect
																							// in
																							// SVG's
																							// namespace
				newRect.setAttribute("height", "12");

				newSvg.appendChild(newRect)
				var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); // Create
																									// a
																									// text
																									// in
																									// SVG's
																									// namespace
				newElement.setAttribute("height", "12");
				newElement.setAttribute("style", 'fill:white; text-anchor:middle; font-size:0.5em;')
				newElement.setAttribute("y", 9);
				newElement.setAttribute("x", offset/2);	
				var txt = document.createTextNode("");
				newElement.appendChild(txt);	
				newSvg.appendChild(newElement)

				/** ************************* */
			   	mySvgToolTip = newSvg
			     	mySvgToolTip.setAttributeNS(null, 'width', '45');
			   	mySvgToolTip.childNodes[0].setAttributeNS(null, 'width', '45');
			   	mySvgToolTip.childNodes[1].innerHTML=this.ToolTip
			   	mySvgToolTip.childNodes[1].setAttribute("style", 'fill:white; text-anchor:middle; font-size:0.4em;')
			   	mySvgToolTip.childNodes[1].setAttributeNS(null, 'x', '22.5');

			   	mySvgToolTip.childNodes[0].setAttributeNS(null, 'style', 'fill:#555; fill-opacity:1.0;');
			   	mySvgToolTip.childNodes[0].setAttributeNS(null, 'ry', '5');
			   	mySvgToolTip.childNodes[0].setAttributeNS(null, 'rx', '5');   	     	  

			   	xPos = myObject.x.animVal.value-10
			   	yPos = myObject.y.animVal.value-10
			   	xPos >  myWidth-70 ? xPos=myWidth-60 : xPos=xPos
			   	xPos < 10 ? xPos=10 : xPos=xPos
				mySvgToolTip.setAttributeNS(null, 'x', xPos);
				mySvgToolTip.setAttributeNS(null, 'y', yPos);
				mySvgToolTip.setAttributeNS(null, 'id', 'mySvgToolTip'); 	   	   	   
				this.parentNode.appendChild(mySvgToolTip)		
			  	}
				if (event.type == 'mouseleave')
				{
				$("#mySvgToolTip").remove()

			  	}
			    })
		  }

		if ( myOptions.showsun == true)
		{
			// SunRise-SVG
			h = sunrise.split(":")[0]
			m = sunrise.split(":")[1]
			mySvgSunRise = this._CreateSvgImage("lib/weather/pics/sun_up.png")
	 		mySvgSunRise.setAttributeNS(null, 'height','12px')
	 		mySvgSunRise.setAttributeNS(null, 'y',13+HeadlineHeight)
	 		xSunrise = (parseInt(h)*60+parseInt(m))
	 		maxSpan = (24*offset)
	 		mySvgSunRise.setAttributeNS(null, 'id',"SunRiseImg")
	 		modWidth=320*(12/206)/2
	 		mySvgSunRise.setAttributeNS(null, 'x',(offset+xSunrise*maxSpan/(24*60)-modWidth))	
			this.element.find("svg")[0].appendChild(mySvgSunRise)
			myText=[]
			myText[0]=this._CreateSvgText(sunrise)
		   	myText[0].classList.add("highcharts-title")			
			myText[0].setAttributeNS(null, 'height','12px')
			myText[0].setAttributeNS(null, 'y',22+HeadlineHeight)
			myText[0].setAttributeNS(null, 'style','font-size:8px')		
			myText[0].setAttributeNS(null, 'x',(offset+xSunrise*maxSpan/(24*60)+modWidth))	
			this.element.find("svg")[0].appendChild(myText[0])		
	 		mySunLines=[]
			mySunLines[1]=this._CreateSvgLine('1.0')
			mySunLines[1].setAttributeNS(null, 'x1', offset+xSunrise*maxSpan/(24*60));
		  	mySunLines[1].setAttributeNS(null, 'x2', offset+xSunrise*maxSpan/(24*60));
			mySunLines[1].setAttributeNS(null, 'y1', 22+HeadlineHeight);
		  	mySunLines[1].setAttributeNS(null, 'y2', 22+7*12+HeadlineHeight);    
			mySunLines[1].setAttributeNS(null, 'style','stroke:yellow;')			  	
			this.element.find("svg")[0].appendChild(mySunLines[1])				  
	 			
			// Sunset-SVG
			h = sunset.split(":")[0]
			m = sunset.split(":")[1]						
			mySvgSunSet = this._CreateSvgImage("lib/weather/pics/sun_down.png")
	 		mySvgSunSet.setAttributeNS(null, 'height','12px')
	 		mySvgSunSet.setAttributeNS(null, 'y',13+HeadlineHeight)
	 		xSunSet= (parseInt(h)*60+parseInt(m))
	 		maxSpan = (24*offset)
	 		mySvgSunSet.setAttributeNS(null, 'id',"SunRiseImg")
	 		modWidth=320*(12/206)/2
	 		mySvgSunSet.setAttributeNS(null, 'x',(offset+xSunSet*maxSpan/(24*60)-modWidth))	
			this.element.find("svg")[0].appendChild(mySvgSunSet)			
			myText[1]=this._CreateSvgText(sunset)
		   	myText[1].classList.add("highcharts-title")						
			myText[1].setAttributeNS(null, 'height','12px')
			myText[1].setAttributeNS(null, 'y',22+HeadlineHeight)
			myText[1].setAttributeNS(null, 'style','font-size:8px')		
			myText[1].setAttributeNS(null, 'x',(offset+xSunSet*maxSpan/(24*60)-25))	
			this.element.find("svg")[0].appendChild(myText[1])		

			mySunLines[2]=this._CreateSvgLine('1.0')
			mySunLines[2].setAttributeNS(null, 'x1', offset+xSunSet*maxSpan/(24*60));
		  	mySunLines[2].setAttributeNS(null, 'x2', offset+xSunSet*maxSpan/(24*60));
			mySunLines[2].setAttributeNS(null, 'y1', 22+HeadlineHeight);
		  	mySunLines[2].setAttributeNS(null, 'y2', 22+7*12+HeadlineHeight);    
			mySunLines[2].setAttributeNS(null, 'style','stroke:yellow;')			  	
			this.element.find("svg")[0].appendChild(mySunLines[2])				  		

		}	
		if (myOptions.showactualtime == true)
		{
	   	  myDate = new Date()
	   	  myactHour = myDate.getHours()
	   	  myactMin  = myDate.getMinutes()
	  	  myactTime = ('00'+myactHour).slice(-2)+':'+('00'+myactMin).slice(-2)

	 	  // Add the actual TimeLine to the SVG
		  maxSpan = (24*offset)
		  actPos  = maxSpan/(24*60)*(myactHour*60+myactMin)
		  myActTimeLine = this._CreateSvgLine('1.0')
		  myActTimeLine.setAttributeNS(null, 'x1', actPos+offset);
		  myActTimeLine.setAttributeNS(null, 'x2', actPos+offset);
		  myActTimeLine.setAttributeNS(null, 'y1', (12*myOptions.showsun)+10+HeadlineHeight);
		  myActTimeLine.setAttributeNS(null, 'y2', 30+(7-!myOptions.showsun)*12+HeadlineHeight);    
		  myActTimeLine.setAttributeNS(null, 'style','stroke:blue;')			  	
		  myActTimeLine.setAttributeNS(null, 'id', 'actTimeLine-'+this.uuid); 	   	   	   	  
	  	  this.element.find("svg")[0].appendChild(myActTimeLine)			  	  
	 	  if (myactHour < 12)
	 	   { modifier = 1}
	 	  else
	 	   { modifier = -43}
	   	  myActTime = this._CreateSvgBox1("0.5")
	     	  myActTime.setAttributeNS(null, 'width', '35');
	   	  myActTime.childNodes[0].setAttributeNS(null, 'width', '35');
	   	  myActTime.childNodes[1].innerHTML=myactTime
	   	  myActTime.childNodes[1].setAttributeNS(null, 'x', '17.5');
	   	  myActTime.childNodes[1].setAttributeNS(null, 'style', 'fill:white;font-size: 0.5em;text-anchor: middle;');

	   	  myActTime.childNodes[0].style.fill='blue'   	  
	   	  myActTime.childNodes[0].setAttributeNS(null, 'style', 'fill:blue; fill-opacity:1.0;');
	   	  myActTime.childNodes[0].setAttributeNS(null, 'ry', '5');
	   	  myActTime.childNodes[0].setAttributeNS(null, 'rx', '5');   	     	  
		  myActTime.setAttributeNS(null, 'x', actPos+offset+modifier);
		  myActTime.setAttributeNS(null, 'y', 20+(7-!myOptions.showsun)*12+HeadlineHeight);
		  myActTime.setAttributeNS(null, 'id', 'actTime-'+this.uuid); 	   	   	   
	  	  this.element.find("svg")[0].appendChild(myActTime)	
		}
		
		// add Checkbox with Active/InActive
		btnActive=this._CreateSvgBox1("0.5")
		btnActive.setAttributeNS(null, 'x', 5);
		btnActive.setAttributeNS(null, 'y', 5);
		btnActive.setAttributeNS(null, "width", "25px");
		btnActive.setAttributeNS(null, "height", "25px");
				
		btnActive.setAttribute("id", "btnActive");
		btnActive.childNodes[0].setAttributeNS(null, "x", "1px");
		btnActive.childNodes[0].setAttributeNS(null, "y", "5px");		
		btnActive.childNodes[0].setAttributeNS(null, "rx", "5");
		btnActive.childNodes[0].setAttributeNS(null, "ry", "5");        
		btnActive.childNodes[0].setAttributeNS(null, "width", "21px");
		btnActive.childNodes[0].setAttributeNS(null, "height", "20px");
		btnActive.childNodes[1].setAttributeNS(null, "width", "19px");
		btnActive.childNodes[1].setAttributeNS(null, "height", "19px");		
		btnActive.childNodes[1].setAttributeNS(null, "style", 'fill:black; text-anchor:middle; font-size:9.5px;')
		btnActive.childNodes[1].setAttributeNS(null, "x", "11.5");
		btnActive.childNodes[1].setAttributeNS(null, "y", "18.5");				

		btnActive.setAttributeNS(null, 'id', 'btnActive'); 	   	   	   
		btnActive.childNodes[0].setAttributeNS(null, 'style', ' fill-opacity:1.0;');// fill:lightgray;


		myDict.active == false ? btnActive.classList.add("icon0") :    btnActive.classList.add("icon1")
		myDict.active == false ? btnActive.childNodes[1].innerHTML=String("???") :btnActive.childNodes[1].innerHTML=String("???");
		this.element.find("svg")[0].appendChild(btnActive)
		  
		 if (myOptions.fill == false)
		  {
		    this._addBackgroundframe()
		    return
	    	  }
		 // Fill the times from ON to OFF
		 actMode = ''
		 for (d=0;d<=6;d++)
		 {
		   for (h=0;h<=23;h++)
		   {
		    minutes = 0
		    for (m=0;m<=myColSpan-1;m++)
		    {
		    minutes = m * nextValue
		    mySvg = 'svg-' + preFix
	  		    + "-"
			    + String("00"+d).slice(-2)
			    + "-"
			    + String("00"+h).slice(-2)
			    + "-"
			    + String("00"+minutes).slice(-2)			

		    mySvgCell = $('#'+mySvg)[0]
		    if (mySvgCell.classList.contains('ON'))  { actMode = 'ON' }
	    	    if (mySvgCell.classList.contains('OFF')) { actMode = 'OFF' }	    		
	    	    
	    	    if (actMode == 'ON')
	    	     {
	   	      mySvgCell.setAttributeNS(null, 'style', "stroke:black;stroke-width:"+ myBorder + "px;fill:" + myOptions['color-on'] + "; fill-opacity:1.0; pointer-events:auto;");
	    	     }
	    	     
		   }
		   }
		 }
		 // Check if 'ON' after end of the week => if yes search next 'OFF'
		 if (actMode == 'ON')
		 {
	 	 for (d=0;d<=6;d++)
		 {
	    	   if (actMode == 'OFF')
	    	    { break }
		   for (h=0;h<=23;h++)
		   {
		    minutes = 0
		    for (m=0;m<=myColSpan-1;m++)
		    {
		    minutes = m * nextValue	   
		    mySvg = 'svg-' + preFix
	  		    + "-"
			    + String("00"+d).slice(-2)
			    + "-"
			    + String("00"+h).slice(-2)
			    + "-"
			    + String("00"+minutes).slice(-2)			

		    mySvgCell = $('#'+mySvg)[0]
	    	    if (mySvgCell.classList.contains('ON'))  { actMode = 'ON' }
	    	    if (mySvgCell.classList.contains('OFF')) { actMode = 'OFF';break }	    		
	    	    
	    	    if (actMode == 'ON')
	    	     {
	   	      mySvgCell.setAttributeNS(null, 'style', "stroke:black;stroke-width:"+ myBorder + "px;fill:" + myOptions['color-on'] + "; fill-opacity:1.0; pointer-events:auto;");    	      
	    	     }
	    	     
		   }
		   }
		 }
		 }
	    this._addBackgroundframe()
	    console.log('finished') 
	    
	},  
	// *****************************************************
	// create svg-rect with text
	// *****************************************************

	_CreateSvgBox1: function (Borderwidth)
	{
		var newSvg  = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); // Create
																						// a
																						// svg
																						// in
																						// SVG's
																						// namespace
		// set width and height
		newSvg.setAttribute("width", 400/25);
		newSvg.setAttribute("height", "12");
		newRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); // Create
																					// a
																					// rect
																					// in
																					// SVG's
																					// namespace
		newRect.setAttribute("width", 400/25);
		newRect.setAttribute("height", "12");
		newRect.setAttribute("style", "fill:white; stroke:black;stroke-width:" + Borderwidth + "px; fill-opacity:0.0");
		newSvg.appendChild(newRect)
		var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); // Create
																							// a
																							// text
																							// in
																							// SVG's
																							// namespace
		newElement.setAttribute("style", 'text-anchor:middle; font-size:0.5em;')
		newElement.setAttribute("y", 9);
		newElement.setAttribute("x", offset/2);	
		var txt = document.createTextNode("");
		newElement.appendChild(txt);	
		newSvg.appendChild(newElement)
		return newSvg
	},
	// *****************************************************
	// add the background-frame
	// *****************************************************
	_addBackgroundframe: function ()
	{
	    svgBackGround=this._CreateSvgBox2('0.5',0)
	    svgBackGround.setAttributeNS(null, 'x', 0);
	    svgBackGround.setAttributeNS(null, 'y', 40);
	    svgBackGround.setAttributeNS(null, 'width',this.options.mySvgWidth-0 );
	    svgBackGround.setAttributeNS(null, 'height','120px' );
	    svgBackGround.setAttributeNS(null, 'style', "stroke:black;stroke-width:"+ "2.0" + "px; fill-opacity: 0.0; pointer-events:none;");    	              	    
	    this.element.find("svg")[0].appendChild(svgBackGround)	
	},
	// *****************************************************
	// create svg-rect without text
	// *****************************************************
	_CreateSvgBox2: function (StrokeWidth,myOverlay)
	{
		newRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); // Create
																					// a
																					// rect
																					// in
																					// SVG's
																					// namespace
		newRect.setAttribute("width",400/25/myColSpan+myOverlay );
		newRect.setAttribute("height", "12");
		newRect.setAttribute("style", "stroke:black;stroke-width:"+ StrokeWidth + "px;fill:yellow; fill-opacity:0.0; pointer-events:visiblePoint");

		return newRect
	},
	// *****************************************************
	// create svg-line
	// *****************************************************
	_CreateSvgLine: function (StrokeWidth)
	{
		newLine = document.createElementNS("http://www.w3.org/2000/svg", 'line'); // Create
																					// a
																					// line
																					// in
																					// SVG's
																					// namespace
		newLine.setAttribute("style", "stroke:black;stroke-width:"+ StrokeWidth + "px; fill-opacity:0.0");

		return newLine
	},
	// *****************************************************
	// create svg-image
	// *****************************************************
	_CreateSvgImage: function (ImageUrl)
	{
		newImage = document.createElementNS("http://www.w3.org/2000/svg", 'image'); // Create
																					// a
																					// Image
																					// in
																					// SVG's
																					// namespace
		newImage.setAttribute("href", ImageUrl);

		return newImage
	},				
	// *****************************************************
	// create svg-text
	// *****************************************************
	_CreateSvgText: function (Text)
	{
		newText = document.createElementNS("http://www.w3.org/2000/svg", 'text'); // Create
																					// a
																					// text
																					// in
																					// SVG's
																					// namespace
		var txt = document.createTextNode(Text);
		newText.appendChild(txt);	


		return newText
	},
	// *****************************************************
	// CalcTimeLine
	// *****************************************************
	_CalcTimeLine: function (myInstance)
	{
	   	  myDate = new Date()
	       	  // Calc the delay
	       	  var delay = (60 - myDate.getSeconds()) * 1000+1000;
		  setTimeout(function()
		  {
		  offset = myInstance.options.mySvgWidth/25

	 	  if (myactHour < 12)
	 	   { modifier = 1}
	 	  else
	 	   { modifier = -43}
		  maxSpan = (24*offset)
		  actPos  = maxSpan/(24*60)*(myactHour*60+myactMin) 	   
		  myActTimeLine = myInstance.element.find('#actTimeLine-'+myInstance.uuid)[0]
  		  myActTime     = myInstance.element.find('#actTime-'+myInstance.uuid)[0]
		  // myActTimeLine = $('#actTimeLine-'+myInstance.uuid, myInstance)
	  	  // myActTime = $('#actTime-'+myInstance.uuid,myInstance)

	  	  try
	  	  {
		   myActTimeLine.setAttributeNS(null, 'x1', actPos+offset);
		   myActTimeLine.setAttributeNS(null, 'x2', actPos+offset);
		   myActTime.setAttributeNS(null, 'x', actPos+offset+modifier); 	     	  
		  }
		  catch(e)
		  {
 		   console.log('problem while updating TimeLine for '+myInstance.uuid + ' Error : '+e)
		  }
		  myDate = new Date()
	   	  myactHour = myDate.getHours()
	   	  myactMin  = myDate.getMinutes()
	  	  myactTime = ('00'+myactHour).slice(-2)+':'+('00'+myactMin).slice(-2)
	  	  		  
	     	  myActTime.childNodes[1].innerHTML=myactTime
	   	  TimeStamp = new Date()	     	  
	     	  // console.log(TimeStamp + '-' + myactTime + '- Seconds : '+
				// TimeStamp.getSeconds()+ ' - Offset:'+ offset +'-Instance
				// :'+myInstance.uuid )

	       	  myInstance._CalcTimeLine(myInstance)
		  },delay)

	},
  // ----------------------------------------------------------------------------
  // Funktionen f??r den Seitenaufbau
  // ----------------------------------------------------------------------------
  _uzsuBuildTableFooter: function() {

    var tt = "";
    // Zeileneintr??ge abschliessen und damit die uzsuTableMain
    tt += "</div>";
    // Aufbau des Footers
      tt += "<div class='uzsuTableFooter'>" +
          "<div class='uzsuRowFooter'>" +
            "<span style='float:right'>";
              // UZSU Interpolation
              if(sv_lang.uzsu.interpolation && this.hasInterpolation){
                tt += "<div class='uzsuCellInterpolation' style='float:left;'>" +
                  "<div class='uzsuCellText'>" + sv_lang.uzsu.options + "</div>" +
                  "<button data-mini='true' data-icon='arrow-d' data-iconpos='notext' class='ui-icon-shadow'></button>" +
                "</div>";
              }
              tt+= "<div class='uzsuCell' style='float: left'>" +
                "<form>" +
                  "<fieldset data-mini='true'>" +
                    "<label><input type='checkbox' id='uzsuGeneralActive'>" + sv_lang.uzsu.active + "</label>" +
                  "</fieldset>" +
                "</form>" +
              "</div>" +
              "<div class='uzsuCell' style='float: left'>" +
              "<div data-role='controlgroup' data-type='horizontal' data-inline='true' data-mini='true'>" +
                "<button id='uzsuAddTableRow'>" + sv_lang.uzsu.add + "</button>" +
                "<button id='uzsuSortTime'>" + sv_lang.uzsu.sort + "</button>" +
              "</div>" +
            "</div>" +
              "<div class='uzsuCell' style='float: right'>" +
                  "<div data-role='controlgroup' data-type='horizontal' data-inline='true' data-mini='true'>" +
                    "<button id='uzsuCancel'>" + sv_lang.uzsu.cancel + "</button>" +
                    "<button id='uzsuSaveQuit'>" + sv_lang.uzsu.ok + "</button>" +
                  "</div>" +
                "</div>" +
              "</div>" +
            "</span>";
            if(sv_lang.uzsu.interpolation && this.hasInterpolation){
              tt +=
                "<div id='uzsuRowInterpolation' style='display: none; float: right; margin: 0 15px 5px 0;'>" +
                  "<span style='float:left; margin-right: 12px;'>" +
                    "<div class='uzsuRowExpertText'>" + sv_lang.uzsu.interpolation + "</div>" +
                    "<div class='uzsuCell'>" +
                      "<div class='uzsuCellText'>" + sv_lang.uzsu.interpolation + "</div>" +
                      "<select data-mini='true' data-native-menu='false' id='uzsuInterpolationType'>" +
                        "<option value='none'>" + sv_lang.uzsu.nointerpolation + "</option>" +
                        "<option value='cubic'>" + sv_lang.uzsu.cubic + "</option>" +
                        "<option value='linear'>" + sv_lang.uzsu.linear + "</option>" +
                      "</select>" +
                    "</div>" +
                    "<div class='uzsuCell'>" +
                      "<div class='uzsuCellText'>" + sv_lang.uzsu.intervaltime + "</div>" +
                      "<input type='number' data-clear-btn='false' id='uzsuInterpolationInterval' style='width:50px;' min='0' class='uzsuValueInput positivenumbers'>" +
                    "</div>" +
                  "</span>" +
                  "<span style='float:left; margin-left: 12px;'>" +
                    "<div class='uzsuRowExpertText'>" + sv_lang.uzsu.inittime + "</div>" +
                    "<div class='uzsuCell'>" +
                      "<div class='uzsuCellText'>" + sv_lang.uzsu.inittime_header + "</div>" +
                      "<input type='number' data-clear-btn='false' id='uzsuInitAge' style='width:50px;' min='0' class='uzsuValueInput positivenumbers'>" +
                      "<div class='uzsuCellText' style='visibility:hidden'><label><input type='checkbox' id='uzsuInitialized'>Init</label></div>" +
                    "</div>" +
                  "</span>" +
                "</div>";
              }
            tt +=
          "</div>";
    // und der Abschluss des uzsuClear als Rahmen f??r den float:left und des
	// uzsuPopup divs
    tt += "</div></div>";
    return tt;
  },

  _uzsuFillTable: function(response) {
    var self = this;
    // Tabelle f??llen. Es werden die Daten aus der Variablen response gelesen
	// und in den Status Darstellung der Widgetbl??cke zugewiesen. Der aktuelle
	// Status in dann in der Darstellung enthalten !
    var numberOfEntries = response.list.length;
    // jetzt wird die Tabelle bef??llt allgemeiner Status, bitte nicht mit attr,
	// sondern mit prop, siehe //
	// https://github.com/jquery/jquery-mobile/issues/5587
    // INTERPOLATION
    if(this.hasInterpolation) {
      $('#uzsuInterpolationType').val(response.interpolation.type).selectmenu("refresh", true);
      $('#uzsuInterpolationInterval').val(response.interpolation.interval);
      $('#uzsuInitAge').val(response.interpolation.initage);
      $('#uzsuInitialized').prop('checked', response.interpolation.initialized).checkboxradio("refresh");
    }
    $('#uzsuGeneralActive').prop('checked', response.active).checkboxradio("refresh");
    // dann die Werte der Tabelle
    $('.uzsuRow').each(function(numberOfRow, tableRow) {
      var responseEntry = response.list[numberOfRow];
      self._uzsuFillTableRow(responseEntry, tableRow);
    });
    // Verhindern negativer Zahleneingabe
    $('.positivenumbers').keypress(function(evt){
        var charCode = (evt.which) ? evt.which : event.keyCode;
        return !(charCode > 31 && (charCode < 48 || charCode > 57));
    });
  },

  _uzsuSaveTable: function(response, saveSmarthome) {
    var self = this;
    // Tabelle auslesen und speichern
    var numberOfEntries = response.list.length;
    // hier werden die Daten aus der Tabelle wieder in die items im Backend
	// zur??ckgespielt bitte darauf achten, dass das zur??ckspielen exakt dem der
	// Anzeige enspricht. Gesamthafte Aktivierung
    response.active = $('#uzsuGeneralActive').is(':checked');
    // Interpolation
    if(this.hasInterpolation) {
      response.interpolation.type = $('#uzsuInterpolationType').val();
      response.interpolation.interval = $('#uzsuInterpolationInterval').val();
      response.interpolation.initage = $('#uzsuInitAge').val();
      response.interpolation.initialized = $('#uzsuInitialized').is(':checked');
    }
    // Einzeleintr??ge
    $('.uzsuRow').each(function(numberOfRow, tableRow) {
      var responseEntry = response.list[numberOfRow];
      self._uzsuSaveTableRow(responseEntry, tableRow);
    });
    // ??ber json Interface / Treiber herausschreiben
    if (saveSmarthome) {
      this._uzsuCollapseTimestring(response);
      this._write(response);
    }
  },

  // ----------------------------------------------------------------------------
  // Funktionen f??r das Erweitern und L??schen der Tabelleneintr??ge
  // ----------------------------------------------------------------------------
  _uzsuAddTableRow: function(response) {
    // Tabellenzeile einf??gen
    // alten Zustand mal in die Liste rein. da der aktuelle Zustand ja nur im
	// Widget selbst enthalten ist, wird er vor dem Umbau wieder in die Variable
	// response zur??ckgespeichert.
    this._uzsuSaveTable(response, false);
    // ich h??nge immer an die letzte Zeile dran ! erst einmal das Array
	// erweitern
    response.list.push({active:false,rrule:'',value:null,event:'time',timeMin:'',timeMax:'',timeCron:'00:00',timeOffset:'',timeOffsetType:'m',condition:{deviceString:'',type:'String',value:'',active:false},delayedExec:{deviceString:'',type:'String',value:'',active:false},holiday:{workday:false,weekend:false}});
    // dann eine neue HTML Zeile genenrieren
    tt = this._uzsuBuildTableRow(response.list.length);
    // Zeile in die Tabelle einbauen
    $(tt).appendTo('#uzsuTable').enhanceWithin();
    // und Daten ausf??llen. hier werden die Zeile wieder mit dem Status
	// beschrieben. Status ist dann wieder im Widget
    this._uzsuFillTable(response);
    // nach unten scrollen
    $("#uzsuTable").scrollTop(function() { return this.scrollHeight; });
  },

  _uzsuDelTableRow: function(response, e) {
    // Zeile und Zeilennummer heraus finden
    var row = $(e.currentTarget).closest('.uzsuRow');
    var numberOfRowToDelete = row.parent().find('.uzsuRow').index(row);
    // Daten aus der Liste l??schen
    response.list.splice(numberOfRowToDelete, 1);
    // Die entsprechende Zeile inkl. den nachfolgenden Expertenzeilen aus dem
	// DOM entfernen
    row.nextUntil('.uzsuRow').addBack().remove();
  },

  // ----------------------------------------------------------------------------
  // Funktionen f??r das Sortrieren der Tabelleneintr??ge
  // ----------------------------------------------------------------------------
  _uzsuSortTime: function(response, e) {
    // erst aus dem Widget zur??cklesen, sonst kann nicht im Array sortiert
	// werden (alte daten)
    this._uzsuSaveTable(response, false);
    // sortieren der Listeneintr??ge nach zeit
    response.list.sort(function(a, b) {
      // sort Funktion, wirklich vereinfacht f??r den speziellen Fall
      // erg??nzt um das sunrise und sunset Thema
      var A = a.timeCron.replace(':', '');
      var B = b.timeCron.replace(':', '');
      // Reihenfolge ist erst die Zeiten, dann sunrise, dann sunset
      if(A == 'sunrise') A = '2400';
      if(A == 'sunset') A = '2401';
      if(B == 'sunrise') B = '2400';
      if(B == 'sunset') B = '2401';
      return (A - B);
    });
    // dann die Eintr??ge wieder schreiben
    this._uzsuFillTable(response);
  },

  // ----------------------------------------------------------------------------
  // Funktionen f??r den Aufbau des Popups und das Einrichten der Callbacks
  // ----------------------------------------------------------------------------
  _uzsuRuntimePopup: function(response) {
    var self = this;
    // Steuerung des Popups erst einmal wird der Leeranteil angelegt
    // erst den Header, dann die Zeilen, dann den Footer
    var tt = this._uzsuBuildTableHeader();
    for (var numberOfRow = 0; numberOfRow < response.list.length; numberOfRow++) {
      tt += this._uzsuBuildTableRow(numberOfRow);
    }
    tt += this._uzsuBuildTableFooter();
    // dann h??ngen wir das an die aktuelle Seite
    var uzsuPopup = $(tt).appendTo(this.element).enhanceWithin().popup().on({
      popupbeforeposition: function(ev, ui) {
        var maxHeight = $(window).height() - 230;
        $(this).find('.uzsuTableMain').css('max-height', maxHeight + 'px').css('overflow-y','auto').css('overflow-x','hidden');
      },
      popupafteropen: function(ev, ui) {
        $(this).popup('reposition', {y: 30})
      },
      popupafterclose: function(ev, ui) {
        $(this).remove();
        $(window).off('resize', self._onresize);
      }
    });
    // dann speichern wir uns f??r cancel die urspr??nglichen im DOM gespeicherten
	// Werte in eine Variable ab
    var responseCancel = jQuery.extend(true, {}, response);
    // dann die Werte eintragen.
    this._uzsuFillTable(response);
    // Popup schliessen mit close rechts oben in der Box oder mit Cancel in der
	// Leiste
    uzsuPopup.find('#uzsuClose, #uzsuCancel').bind('click', function(e) {
      // wenn keine ??nderungen gemacht werden sollen (cancel), dann auch im
		// cache die alten Werte
      uzsuPopup.popup('close');
    });

    // speichern mit SaveQuit
    uzsuPopup.find('#uzsuSaveQuit').bind('click', function(e) {
      // jetzt wird die Kopie auf das Original kopiert und geschlossen
      self._uzsuSaveTable(response, true);
      uzsuPopup.popup('close');
    });
    // Eintrag hinzuf??gen mit add
    uzsuPopup.find('#uzsuAddTableRow').bind('click', function(e) {
      self._uzsuAddTableRow(response);
    });
    // Eintrag sortieren nach Zeit
    uzsuPopup.find('#uzsuSortTime').bind('click', function(e) {
      self._uzsuSortTime(response);
    });
    // L??schen mit del als Callback eintragen
    uzsuPopup.delegate('.uzsuDelTableRow', 'click', function(e) {
      self._uzsuDelTableRow(response, e);
    });
    // Kohler - Start 20210703
    uzsuPopup.delegate('.uzsuCellSerie button', 'click', function(e) {
        if($(this).hasClass('ui-icon-arrow-l'))
        	self._uzsuHideAllSeriesLines();
        else
            self._uzsuShowSeriesLine(e);
      });
    // Kohler - Ende 20210703
    // call Expert Mode
    uzsuPopup.delegate('.uzsuCellExpert button', 'click', function(e) {
      if($(this).hasClass('ui-icon-arrow-u'))
        self._uzsuHideAllExpertLines();
      else
        self._uzsuShowExpertLine(e);
    });
    // Handler, um den expert button Status zu setzen
    uzsuPopup.delegate('input.expertActive', 'change', function (){
      self._uzsuSetExpertColor($(this));
    });
    // Handler, um den Status anhand des Pulldowns SUN zu setzen
    uzsuPopup.delegate('.uzsuRowExpert .uzsuEvent select, input.uzsuSunActive', 'change', function (){
      self._uzsuSetSunActiveState($(this));
    });
    // Kohler 20210703 - Start
    // Handler, um den Status anhand des Pulldowns SUN zu setzen
    // Handler, um den Series button Status zu setzen
    uzsuPopup.delegate('input.uzsuSerieActive', 'change', function (){
      self._uzsuSetSeriesColor($(this));
    });
    uzsuPopup.delegate('.uzsuRowSeries .uzsuEvent select, input.uzsuSerieActive', 'change', function (){
      self._uzsuSetSerieActiveState($(this));
    });
    // Kohler 20210703 - Ende
    // call Interpolation Mode
    uzsuPopup.delegate('.uzsuCellInterpolation button', 'click', function(e) {
      if($(this).hasClass('ui-icon-arrow-u'))
        self._uzsuHideInterpolationLine();
      else
        self._uzsuShowInterpolationLine(e);
    });

    // hier wir die aktuelle Seite danach durchsucht, wo das Popup ist und im
	// folgenden das Popup initialisiert, ge??ffnet und die schliessen
    // Funktion daran gebunden. Diese entfernt wieder das Popup aus dem DOM Baum
	// nach dem Schliessen mit remove
    uzsuPopup.popup('open');// .css({ position: 'fixed', top: '30px' });
  },
  _uzsuParseAndCheckResponse: function(response) {
    var designType = this.options.designtype;
    var valueType = this.options.valuetype;

    // Fehlerbehandlung f??r ein nicht vorhandenes DOM Objekt. Das response
	// Objekt ist erst da, wenn es mit update angelegt wurde. Da diese
    // Schritte asynchron erfolgen, kann es sein, dass das Icon bereits da ist,
	// clickbar, aber nocht keine Daten angekommen. Dann darf ich nicht auf
	// diese Daten zugreifen wollen !
    if(response.list === undefined){
      notify.error("UZSU widget", "No UZSU data available in item '" + this.options.item + "' for widget " + this.id + ".");
      return false;
    }

    // jetzt kommt noch die Liste von Pr??fungen, damit hinterher keine Fehler
	// passieren, zun??chst fehlerhafter designType (unbekannt)
    if ((designType != '0') && (designType != '2')) {
      notify.error("UZSU widget", "Design type '" + designType + "' is not supported in widget " + this.id + ".");
      return false;
    }
    // fehlerhafter valueType (unbekannt)
    if ((valueType !== 'bool') && (valueType !== 'num')  && (valueType !== 'text') && (valueType !== 'list')) {
      notify.error("UZSU widget", "Value type '" + valueType + "' is not supported in widget " + this.id + ".");
      return false;
    }

    // Interpolation f??r SmartHomeNG setzen
    if(designType == '0') {
      if(response.interpolation === undefined){
        this.hasInterpolation = false
        console.log('UZSU interpolation not available. You have to update the plugin version');
        // response.interpolation =
		// {type:'none',interval:0,initage:0,initialized:false,itemtype:'none'};
      }
      else if(!response.interpolation.itemtype in ['num']) {
        this.hasInterpolation = false
        notify.warn('UZSU interpolation not supported by itemtype');
      }
      else {
        this.hasInterpolation = true
        console.log('UZSU interpolation set to ' + response.interpolation.type);
      }
    }

    //
    // Umsetzung des time parameters in die Struktur, die wir hinterher nutzen
	// wollen
    //
    $.each(response.list, function(numberOfRow, entry) {

      // bei designType '0' wird rrule nach Wochentagen umgewandelt und ein
		// festes Format vorgegegeben hier sollte nichts versehentlich
		// ??berschrieben werden
      if (designType == '0') {
        // "time" von SmartHomeNG parsen
        var timeParts = (entry.time || "").match(/^((\d{1,2}:\d{1,2})<)?(sunrise|sunset)(([+-]\d+)([m??]?))?(<(\d{1,2}:\d{1,2}))?$/);
        if(timeParts == null) { // entry.time is a plain time string
          entry.event = "time";
          entry.timeCron = entry.time;
          entry.timeMin = "";
          entry.timeMax = "";
          entry.timeOffset = "";
          entry.timeOffsetType = "m";
        }
        else { // entry.time is a sun event
          entry.event = timeParts[3];
          entry.timeCron = '00:00';
          entry.timeMin = timeParts[2];
          entry.timeMax = timeParts[8];
          entry.timeOffset = Number(timeParts[5]);
          entry.timeOffsetType = timeParts[6];
        }
        delete entry.time;

        // test, ob die RRULE fehlerhaft ist
        if (entry.rrule && (entry.rrule.length > 0) && (entry.rrule.indexOf('FREQ=WEEKLY;BYDAY=') !== 0)) {
          if (!confirm("Error: Parameter designType is '0', but saved RRULE string in UZSU '" + entry.rrule + "' does not match default format FREQ=WEEKLY;BYDAY=MO... on item " + this.options.item  + ". Should this entry be overwritten?")) {
            return false;
          }
        }

      }

      // wenn designType = '2' und damit fhem auslegung ist muss der JSON
		// String auf die entsprechenden eintr??ge erweitert werden (falls nichts
		// vorhanden)
      if (designType == '2') {
        // test, ob die eintr??ge f??r conditions vorhanden sind
        if (entry.condition === undefined){
          entry.condition = {deviceString:'',type:'String',value:'',active:false};
        }
        // test, ob die eintr??ge f??r delayed exec vorhanden sind
        if (entry.delayedExec === undefined){
          entry.delayedExec = {deviceString:'',type:'String',value:'',active:false};
        }
        // test, ob die eintr??ge f??r holiday gesetzt sind
        if (entry.holiday === undefined){
          entry.holiday = {workday:false, weekend:false};
        }
      }
    });

    return true;
  },
    _uzsuBuildTableHeader: function() {
    // Kopf und ??berschrift des Popups
    var tt = "";
    // hier kommt der Popup Container mit der Beschreibung ein Eigenschaften
    tt +=   "<div data-role='popup' data-overlay-theme='b' data-theme='a' class='messagePopup' id='uzsuPopupContent' data-dismissible = 'false' data-history='false' data-position-to='window'>" +
          "<button data-rel='back' data-icon='delete' data-iconpos='notext' class='ui-btn-right' id='uzsuClose'></button>" +
          "<div class='uzsuClear'>" +
            "<div class='uzsuPopupHeader'>" + this.options.headline + "</div>" +
            "<div class='uzsuTableMain' id='uzsuTable'>";
    return tt;
  },
    _uzsuBuildTableRow: function(numberOfRow) {
    // default Werte setzen fuer valueParameterList
    var valueType = this.options.valuetype;
    var valueParameterList = this.options.valueparameterlist.explode();
    if(valueParameterList.length === 0){
      if(valueType === 'bool') valueParameterList = ['On','Off'];
      else if (valueType === 'num') valueParameterList = [''];
      else if (valueType === 'text') valueParameterList = [''];
      else if (valueType === 'list') valueParameterList = [''];
    }
    // Tabelleneintr??ge
    var tt = "";

    tt +=   "<div class='uzsuRow'>" +
          "<div class='uzsuCell'>" +
            "<div class='uzsuCellText'>" + sv_lang.uzsu.weekday + "</div>" +
              "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true' class='uzsuWeekday'>";
              // rrule Wochentage (ist eine globale Variable von SV, Sonntag
				// hat index 0 deshalb Modulo 7)
              var daydate = new Date(0);
              $.each([ 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU' ], function(index, value) {
                daydate.setDate(5 + index); // Set date to one on according
											// weekday (05.01.1970 was a monday)
                tt += "<label title='" + daydate.transUnit('l') + "'><input type='checkbox' value='" + value + "'>" + daydate.transUnit('D') + "</label>";
              });
    tt +=      "</fieldset>" +
            "</div>";

    tt +=   "<div class='uzsuCell uzsuValueCell'>" +
          "<div class='uzsuCellText'>" + sv_lang.uzsu.value + "</div>";
    if (this.options.valuetype === 'bool') {
      // Unterscheidung Anzeige und Werte
      if (valueParameterList[0].split(':')[1] === undefined) {
        tt += "<select data-role='flipswitch'>" +
                "<option value='0'>" + valueParameterList[1] + "</option>" +
                "<option value='1'>"  + valueParameterList[0] + "</option>" +
              "</select>";
      }
      else {
        tt += "<select data-role='flipswitch'>" +
                "<option value='" + valueParameterList[1].split(':')[1]  + "'>" + valueParameterList[1].split(':')[0] + "</option>" +
                "<option value='" + valueParameterList[0].split(':')[1]  + "'>" + valueParameterList[0].split(':')[0] + "</option>" +
              "</select>";
      }
    }
    else if (this.options.valuetype === 'num') {
      var addedclass = (parseFloat(valueParameterList[0]) < 0) ? "" : " positivenumbers";
      tt +=   "<input type='number' min='" + parseFloat(valueParameterList[0]) + "' max='" + parseFloat(valueParameterList[1]) + "' step='" + parseFloat(valueParameterList[2]) + "' data-clear-btn='false' class='uzsuValueInput" + addedclass + "' pattern='[0-9]*'>";
    }
    else if (this.options.valuetype === 'text') {
      tt +=   "<input type='text' data-clear-btn='false' class='uzsuTextInput'>";
    }
    else if (this.options.valuetype === 'list') {
      // das Listenformat mit select ist sehr umfangreich nur einzubauen.
      tt +=   "<select data-mini='true'>";
              for (var numberOfListEntry = 0; numberOfListEntry < valueParameterList.length; numberOfListEntry++) {
                // Unterscheidung Anzeige und Werte
                if (valueParameterList[0].split(':')[1] === undefined) {
                  tt += "<option value='" + valueParameterList[numberOfListEntry].split(':')[0]  + "'>"+ valueParameterList[numberOfListEntry].split(':')[0]  + "</option>";
                }
                else {
                  tt += "<option value='" + valueParameterList[numberOfListEntry].split(':')[1]  + "'>"+ valueParameterList[numberOfListEntry].split(':')[0]  + "</option>";
                }
              }
      tt +=   "</select>";
    }
    tt+=  "</div>"
    tt+=  "<div class='uzsuCell'>" +
          "<div class='uzsuCellText'>" + sv_lang.uzsu.time + "</div>" +
          "<input type='time' data-clear-btn='false' class='uzsuTimeInput uzsuTimeCron'>" +
        "</div>" +
        "<div class='uzsuCell'>" +
          "<div class='uzsuCellText'></div>" +
          "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
            "<label><input type='checkbox' class='uzsuActive'>" + sv_lang.uzsu.act + "</label>" +
        "</div>" +
        "<div class='uzsuCellExpert'>" +
          "<div class='uzsuCellText'>" + sv_lang.uzsu.expert + "</div>" +
          "<button data-mini='true' data-icon='arrow-d' data-iconpos='notext' class='ui-icon-shadow'></button>" +
        "</div>" +
        // Kohler - Start 20210703
        "<div class='uzsuCellSerie'>" +
          "<div class='uzsuCellText'>" + "TimeSeries" + "</div>" +
            "<button data-mini='true' data-icon='arrow-r' data-iconpos='notext' class='ui-icon-shadow'></button>" +
        "</div>" +
        // Kohler - Ende 20210703
        "<div class='uzsuCell'>" +
          "<div class='uzsuCellText'></div>" +
          "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
            "<button class='uzsuDelTableRow' data-mini='true'>" + sv_lang.uzsu.del + "</button>" +
          "</fieldset>" +
        "</div>";
    // Tabelle Zeile abschliessen
    tt +=   "</div>";
    // Kohler Start 20210703
    // jetzt noch die unsichtbare Time-Serieszeile
    if (this.options.designtype == '0'){
    tt +=   "<div class='uzsuRowSeries' style='display:none;'>" +
    "<div class='uzsuRowSerie' style='float: left;'>" +
    "<div class='uzsuRowExpertText'>" + 'Series' + "</div>" +
      "<div class='uzsuCell'>" +
        "<div class='uzsuCellText'>" + "Start-Zeit" + "</div>" +
        "<input type='time' data-clear-btn='false' class='uzsuSerieTimeMaxMinInput uzsuTimeSerieMin'>" +
      "</div>" +
      "<div class='uzsuCell'>" +
        "<div class='uzsuCellText'>" + "End-Zeit" + "</div>" +
        "<input type='time' data-clear-btn='false' class='uzsuSerieTimeMaxMinInput uzsuTimeSerieMax'>" +
      "</div>" +      
      "<div class='uzsuCell'>" +
        "<div class='uzsuCellText'>" + "Interval" + "</div>" +
        "<input type='time' data-clear-btn='false' class='uzsuSerieTimeMaxMinInput uzsuSerieTimeInterval'>" +
      "</div>" +
      "<div class='uzsuCell'>" +
      "<div class='uzsuCellText'></div>" +
        "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
          "<label><input type='checkbox' class='uzsuSerieActive'>" + sv_lang.uzsu.act + "</label>" +
        "</fieldset>" +
      "</div>" + 
      "</div>";

    tt += "</div>";    
    }
    // Kohler Ende 20210703
    // und jetzt noch die unsichtbare Expertenzeile
    tt +=   "<div class='uzsuRowExpHoli' style='display:none;'>" +
          "<div class='uzsuRowExpert' style='float: left;'>" +
            "<div class='uzsuRowExpertText'>" + sv_lang.uzsu.sun + "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>" + sv_lang.uzsu.earliest + "</div>" +
              "<input type='time' data-clear-btn='false' class='uzsuTimeMaxMinInput uzsuTimeMin'>" +
            "</div>" +
            "<div class='uzsuCell uzsuEvent'>" +
              "<div class='uzsuCellText'>Event</div>" +
              "<select data-mini='true' data-native-menu='false'>" +
                "<option value='sunrise'>" + sv_lang.uzsu.sunrise + "</option>" +
                "<option value='sunset'>" + sv_lang.uzsu.sunset + "</option>" +
              "</select>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>+/-" + (this.options.designtype == '0' ? '' : ' min.') +"</div>" +
              "<input type='number' data-clear-btn='false' class='uzsuTimeMaxMinInput uzsuTimeOffsetInput'>" +
            "</div>";
          // Auswahl f??r Offset in Grad oder Minuten (nur f??r SmartHomeNG)
          if (this.options.designtype == '0'){
            tt +=   "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'></div>" +
                "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true' class='uzsuTimeOffsetTypeInput'>" +
                  "<label title='Minutes'><input type='radio' name='uzsuTimeOffsetTypeInput"+numberOfRow+"' value='m' checked='checked'>m</label>" +
                  "<label title='Degrees of elevation'><input type='radio' name='uzsuTimeOffsetTypeInput"+numberOfRow+"' value=''>??</label>" +
              "</fieldset>" +
            "</div>";
          }
            tt +=   "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>" + sv_lang.uzsu.latest + "</div>" +
              "<input type='time' data-clear-btn='false' class='uzsuTimeMaxMinInput uzsuTimeMax'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'></div>" +
              "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
                "<label><input type='checkbox' class='expertActive uzsuSunActive'>" + sv_lang.uzsu.act + "</label>" +
              "</fieldset>" +
            "</div>";
            // UZSU Interpolation
            if(sv_lang.uzsu.interpolation && this.hasInterpolation){
              tt +=   "<div class='uzsuCell'>" +
                "<div class='uzsuCellText'>" + sv_lang.uzsu.calculated + "</div>" +
                "<div data-tip='" + sv_lang.uzsu.calculatedtip + "'>" +
                "<input type='time' data-clear-btn='false' class='uzsuTimeMaxMinInput uzsuCalculated' disabled>" +
                "</div>" +
              "</div>";
            }
          tt += "</div>";
      // hier die Eintr??ge f??r holiday weekend oder nicht
      if (this.options.designtype == '2'){
        tt +=   "<div class='uzsuRowHoliday' style='float: left;'>" +
              "<div class='uzsuRowHolidayText'>Holiday</div>" +
              "<div class='uzsuCell'>" +
                "<div class='uzsuCellText'>Holiday</div>" +
                "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
                  "<label><input type='checkbox' class='expertActive uzsuHolidayWorkday'>!WE</label>" +
                   "<label><input type='checkbox' class='expertActive uzsuHolidayWeekend'>WE</label>" +
                "</fieldset>" +
              "</div>" +
            "</div>";
      }
      tt+=   "</div>";

    // und jetzt noch die unsichbare Condition und delayed Exec Zeile
    if(this.options.designtype == '2'){
      tt +=   "<div class='uzsuRowCondition' style='display:none;'>" +
            "<div class='uzsuRowConditionText'>Condition</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Device / String</div>" +
              "<input type='text' data-clear-btn='false' class='uzsuConditionDeviceStringInput'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Condition Type</div>" +
              "<select data-mini='true' class='uzsuConditionType'>" +
                "<option value='eq'>=</option>" +
                "<option value='<'><</option>" +
                "<option value='>'>></option>" +
                "<option value='>='>>=</option>" +
                "<option value='<='><=</option>" +
                "<option value='ne'>!=</option>" +
                "<option value='String'>String</option>" +
              "</select>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Value</div>" +
              "<input type='text' data-clear-btn='false' class='uzsuConditionValueInput'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'></div>" +
              "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
                "<label><input type='checkbox' class='expertActive uzsuConditionActive'>Act</label>" +
              "</fieldset>" +
            "</div>" +
          "</div>";
      // delayed exec zeile
      tt +=   "<div class='uzsuRowDelayedExec' style='display:none;'>" +
            "<div class='uzsuRowDelayedExecText'>DelayedExec</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Device / String</div>" +
              "<input type='text' data-clear-btn='false' class='uzsuDelayedExecDeviceStringInput'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>DelayedExec Type</div>" +
              "<select data-mini='true' class='uzsuDelayedExecType'>" +
                "<option value='eq'>=</option>" +
                "<option value='<'><</option>" +
                "<option value='>'>></option>" +
                "<option value='>='>>=</option>" +
                "<option value='<='><=</option>" +
                "<option value='ne'>!=</option>" +
                "<option value='String'>String</option>" +
              "</select>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'>Value</div>" +
              "<input type='text' data-clear-btn='false' class='uzsuDelayedExecValueInput'>" +
            "</div>" +
            "<div class='uzsuCell'>" +
              "<div class='uzsuCellText'></div>" +
              "<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
                "<label><input type='checkbox' class='expertActive uzsuDelayedExecActive'>Act</label>" +
              "</fieldset>" +
            "</div>" +
          "</div>";
    }
    return tt;
  },
    _uzsuFillTableRow: function(responseEntry, tableRow) {
    var self = this;
    // dann die Werte einer Tabellenzeile f??llen

    uzsuCurrentRows = $(tableRow).nextUntil('.uzsuRow').addBack();

    if(responseEntry.value != null) {
      // beim Schreiben der Daten Unterscheidung, da sonst das Element falsch
		// genutzt wird mit Flipswitch f??r die bool Variante
      if (self.options.valuetype === 'bool') {
        uzsuCurrentRows.find('.uzsuValueCell select').val(responseEntry.value).flipswitch("refresh");
      }
      // mit int Value f??r die num Variante
      else if ((self.options.valuetype === 'num') || (self.options.valuetype === 'text')) {
        uzsuCurrentRows.find('.uzsuValueCell input').val(responseEntry.value);
      }
      else if (self.options.valuetype === 'list') {
        uzsuCurrentRows.find('.uzsuValueCell select').val(responseEntry.value).selectmenu('refresh', true);
      }
    }
    // Values in der Zeile setzen
    uzsuCurrentRows.find('.uzsuActive').prop('checked',responseEntry.active).checkboxradio("refresh");
    // hier die conditions, wenn sie im json angelegt worden sind und zwar pro
	// zeile !
    if(self.options.designtype == '2'){
      // Condition
      uzsuCurrentRows.find('.uzsuConditionDeviceStringInput').val(responseEntry.condition.deviceString);
      uzsuCurrentRows.find('select.uzsuConditionType').val(responseEntry.condition.type).selectmenu('refresh', true);
      uzsuCurrentRows.find('.uzsuConditionValueInput').val(responseEntry.condition.value);
      uzsuCurrentRows.find('.uzsuConditionActive').prop('checked',responseEntry.condition.active).checkboxradio("refresh");
      // Delayed Exec Zeile
      uzsuCurrentRows.find('.uzsuDelayedExecDeviceStringInput').val(responseEntry.delayedExec.deviceString);
      uzsuCurrentRows.find('select.uzsuDelayedExecType').val(responseEntry.delayedExec.type).selectmenu('refresh', true);
      uzsuCurrentRows.find('.uzsuDelayedExecValueInput').val(responseEntry.delayedExec.value);
      uzsuCurrentRows.find('.uzsuDelayedExecActive').prop('checked',responseEntry.delayedExec.active).checkboxradio("refresh");
    }
    uzsuCurrentRows.find('.uzsuTimeMin').val(responseEntry.timeMin);
    uzsuCurrentRows.find('.uzsuTimeOffsetInput').val(parseInt(responseEntry.timeOffset));
    if(self.options.designtype == '0') {
      // name='uzsuTimeOffsetTypeInput'
      uzsuCurrentRows.find('.uzsuTimeOffsetTypeInput').find(':radio').prop('checked', false).checkboxradio("refresh")
        .end().find('[value="'+responseEntry.timeOffsetType+'"]:radio').prop('checked', true).checkboxradio("refresh");
    }
    // Kohler Start 20210703
    if(self.options.designtype == '0') {
    	if (responseEntry.hasOwnProperty("series"))
    		{
    		uzsuCurrentRows.find('.uzsuSerieActive').prop('checked',responseEntry.series.active).checkboxradio("refresh");
    		uzsuCurrentRows.find('.uzsuTimeSerieMin').val(responseEntry.series.timeSeriesMin);
    		uzsuCurrentRows.find('.uzsuTimeSerieMax').val(responseEntry.series.timeSeriesMax);
    		uzsuCurrentRows.find('.uzsuSerieTimeInterval').val(responseEntry.series.timeSeriesIntervall);
    		// den Status richtig setzen
    		if (responseEntry.series.active == true)
    			{
    			self._uzsuSetSeriesColor(uzsuCurrentRows.find('.uzsuSerieActive').first());
    			self._uzsuSetSerieActiveState(uzsuCurrentRows.find('.uzsuRowSerie .uzsuSerieActive'))
    			}
    		}
    	console.log("smarthomeNG")
      }
    // Kohler Ende 20210703
    uzsuCurrentRows.find('.uzsuTimeMax').val(responseEntry.timeMax);
    uzsuCurrentRows.find('.uzsuTimeCron').val(responseEntry.timeCron);
    if(responseEntry.calculated != null) {
      uzsuCurrentRows.find('.uzsuCalculated').val(responseEntry.calculated);
    }
    // und die pull down Men??s richtig, damit die Eintr??ge wieder stimmen und
	// auch der active state gesetzt wird
    if(responseEntry.event === 'time'){
      uzsuCurrentRows.find('.uzsuSunActive').prop('checked',false).checkboxradio("refresh");
    }
    else{
      uzsuCurrentRows.find('.uzsuSunActive').prop('checked',true).checkboxradio("refresh");
      uzsuCurrentRows.find('.uzsuRowExpert .uzsuEvent select').val(responseEntry.event).selectmenu('refresh', true);
    }
    // in der Tabelle die Werte der rrule, dabei gehe ich von dem Standardformat
	// FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU aus und setze f??r jeden Eintrag
	// den Button.
    var rrule = responseEntry.rrule;
    if (typeof rrule === "undefined") {
      rrule = '';
    }
    var ind = rrule.indexOf('BYDAY');
    // wenn der Standard drin ist
    if (ind > 0) {
      var days = rrule.substring(ind);
      // Setzen der Werte
      uzsuCurrentRows.find('.uzsuWeekday input[type="checkbox"]').each(function(numberOfDay) {
        $(this).prop('checked', days.indexOf($(this).val()) > 0).checkboxradio("refresh");
      });
    }
    // jetzt die holiday themem f??r fhem
    if(self.options.designtype == '2'){
      uzsuCurrentRows.find('.uzsuHolidayWorkday').prop('checked', responseEntry.holiday.workday).checkboxradio("refresh");
      uzsuCurrentRows.find('.uzsuHolidayWeekend').prop('checked', responseEntry.holiday.weekend).checkboxradio("refresh");
    }
    // Fallunterscheidung f??r den Expertenmodus
    self._uzsuSetSunActiveState(uzsuCurrentRows.find('.uzsuRowExpert .uzsuEvent select'));
    self._uzsuSetExpertColor(uzsuCurrentRows.find('.expertActive').first());
  },
    // Toggelt die eingabem??glichkeit f??r SUN Elemente in Abh??ngigkeit der
	// Aktivschaltung
  _uzsuSetSunActiveState: function(element){
    // status der eingaben setzen, das brauchen wir an mehreren stellen
    var uzsuRowExpHoli = element.parents('.uzsuRowExpHoli');
    var uzsuTimeCron = uzsuRowExpHoli.prevUntil('.uzsuRowExpHoli').find('.uzsuTimeCron');
    var uzsuCalc = uzsuRowExpHoli.find('.uzsuCalculated').val();
    if (uzsuRowExpHoli.find('.uzsuSunActive').is(':checked')){
      uzsuTimeCron.attr('type','input').val(uzsuRowExpHoli.find('.uzsuEvent select').val()).textinput('disable');
      var myExpertrow = uzsuRowExpHoli.prev();
      myExpertrow.find('.uzsuSerieActive').prop('checked',false).checkboxradio("refresh");
    }
    else{
      if(uzsuTimeCron.val().indexOf('sun')===0)
   	    uzsuTimeCron.attr('type','time').val((uzsuCalc == undefined || uzsuCalc == '') ? '00:00' : uzsuCalc);
      if(uzsuTimeCron.val().indexOf('serie')!=0)
        uzsuTimeCron.textinput('enable');
         
          
    }
  },
  // Kohler Start - 20210703
  // Toggelt die eingabem??glichkeit f??r SERIES Elemente in Abh??ngigkeit der
	// Aktivschaltung
  _uzsuSetSerieActiveState: function(element){
    // status der eingaben setzen, das brauchen wir an mehreren stellen
    var uzsuRowExpHoli = element.parents('.uzsuRowSeries');
    var uzsuTimeCron = uzsuRowExpHoli.prevUntil('.uzsuRowExpHoli').find('.uzsuTimeCron');
    var uzsuCalc = uzsuRowExpHoli.find('.uzsuCalculated').val();
    if (uzsuRowExpHoli.find('.uzsuSerieActive').is(':checked')){
    	uzsuTimeCron.attr('type','input').val('serie').textinput('disable');
    	//uzsuTimeCron.attr('type','input').textinput('disable');
    	var myExpertrow = uzsuRowExpHoli.nextUntil('.uzsuRow');
    	myExpertrow.find('.uzsuSunActive').prop('checked',false).checkboxradio("refresh");
    }
    else{
      if(uzsuTimeCron.val().indexOf('serie')===0)
   	    uzsuTimeCron.attr('type','time').val((uzsuCalc == undefined || uzsuCalc == '') ? '00:00' : uzsuCalc);
      uzsuTimeCron.textinput('enable');
    }
  },
  // Setzt die Farbe des Seriesbuttons, je nach dem, ob eine der Optionen
	// aktiv geschaltet wurde
  _uzsuSetSeriesColor: function(changedCheckbox){
    var rows = changedCheckbox.parents('.uzsuRowSeries, .uzsuRowCondition, .uzsuRowDelayedExec').prevAll('.uzsuRow').first().nextUntil('.uzsuRow').addBack();
    if (rows.find('.uzsuSerieActive').is(':checked'))
    	{
    	rows.find('.uzsuCellSerie button').addClass('ui-btn-active');
    	rows.find('.uzsuCellExpert button').removeClass('ui-btn-active');
    	}
    else
      {
    	rows.find('.uzsuCellSerie button').removeClass('ui-btn-active');
      }
  },  
  // Kohler Ende - 20210703
  
    // Setzt die Farbe des Expertenbuttons, je nach dem, ob eine der Optionen
	// aktiv geschaltet wurde
  _uzsuSetExpertColor: function(changedCheckbox){
    var rows = changedCheckbox.parents('.uzsuRowExpHoli, .uzsuRowCondition, .uzsuRowDelayedExec').prevAll('.uzsuRow').first().nextUntil('.uzsuRow').addBack();
    if (rows.find('.expertActive').is(':checked'))
    	{
    	rows.find('.uzsuCellExpert button').addClass('ui-btn-active');
    	rows.find('.uzsuCellSerie button').removeClass('ui-btn-active');
    	}
    else
      rows.find('.uzsuCellExpert button').removeClass('ui-btn-active');
  },
    _uzsuSaveTableRow: function(responseEntry, tableRow) {
    var self = this;

    uzsuCurrentRows = $(tableRow).nextUntil('.uzsuRow').addBack();
    responseEntry.value = uzsuCurrentRows.find('.uzsuValueCell select, .uzsuValueCell input').val();
    responseEntry.active = uzsuCurrentRows.find('.uzsuActive').is(':checked');
    // hier die conditions, wenn im json angelegt
    if(self.options.designtype == '2'){
      // conditions
      responseEntry.condition.deviceString = uzsuCurrentRows.find('.uzsuConditionDeviceStringInput').val();
      responseEntry.condition.type = uzsuCurrentRows.find('select.uzsuConditionType').val();
      responseEntry.condition.value = uzsuCurrentRows.find('.uzsuConditionValueInput').val();
      responseEntry.condition.active = uzsuCurrentRows.find('.uzsuConditionActive').is(':checked');
      // deleayed exec
      responseEntry.delayedExec.deviceString = uzsuCurrentRows.find('.uzsuDelayedExecDeviceStringInput').val();
      responseEntry.delayedExec.type = uzsuCurrentRows.find('select.uzsuDelayedExecType').val();
      responseEntry.delayedExec.value = uzsuCurrentRows.find('.uzsuDelayedExecValueInput').val();
      responseEntry.delayedExec.active = uzsuCurrentRows.find('.uzsuDelayedExecActive').is(':checked');
    }
    responseEntry.timeMin = uzsuCurrentRows.find('.uzsuTimeMin').val();
    responseEntry.timeOffset = uzsuCurrentRows.find('.uzsuTimeOffsetInput').val();
    if(self.options.designtype == '0'){
      responseEntry.timeOffsetType = uzsuCurrentRows.find('.uzsuTimeOffsetTypeInput :radio:checked').val();
    }
    responseEntry.timeMax = uzsuCurrentRows.find('.uzsuTimeMax').val();
    responseEntry.timeCron = uzsuCurrentRows.find('.uzsuTimeCron').val();
    // event etwas komplizierter, da ??bergangsl??sung
    if(uzsuCurrentRows.find('.uzsuSunActive').is(':checked')){
      responseEntry.event = uzsuCurrentRows.find('.uzsuEvent select').val();
    }
    else{
      responseEntry.event = 'time';
    }
    // in der Tabelle die Werte der rrule, dabei gehe ich von dem Standardformat
	// FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU aus und setze f??r jeden Eintrag
	// den Button. Setzen der Werte.
    var first = true;
    var rrule = '';
    uzsuCurrentRows.find('.uzsuWeekday input[type="checkbox"]').each(function(numberOfDay) {
      if ($(this).is(':checked')) {
        if (first) {
          first = false;
          rrule = 'FREQ=WEEKLY;BYDAY=' + $(this).val();
        }
        else {
          rrule += ',' + $(this).val();
        }
      }
    });
    responseEntry.rrule = rrule;
    // jetzt die holiday themem f??r fhem
    if(self.options.designtype === '2'){
      responseEntry.holiday.workday = uzsuCurrentRows.find('.uzsuHolidayWorkday').is(':checked');
      responseEntry.holiday.weekend = uzsuCurrentRows.find('.uzsuHolidayWeekend').is(':checked');
    }
    // Kohler Start - 20210703
    if(self.options.designtype === '0'){
    	if (uzsuCurrentRows.find('.uzsuCellSerie button').hasClass("ui-btn-active") == true)
    		{
	    	responseEntry.series = {};
	    	responseEntry.series.active = uzsuCurrentRows.find('.uzsuCellSerie button').hasClass("ui-btn-active")
	    	responseEntry.series.timeSeriesMin = uzsuCurrentRows.find('.uzsuTimeSerieMin').val();
	    	responseEntry.series.timeSeriesMax = uzsuCurrentRows.find('.uzsuTimeSerieMax').val();
	    	responseEntry.series.timeSeriesIntervall = uzsuCurrentRows.find('.uzsuSerieTimeInterval').val();
    		}
    	else
    		{
    		try
    		 { delete responseEntry.series; }
    		catch (e)
    		 {}
    		}
    };
    
    // Kohler Ende - 20210703
  },
    _uzsuCollapseTimestring: function(response){
    var self = this;

    // Clear unused properties for FHEM
    if (self.options.designtype == '2') {
      delete response.interpolation;
    }

    $.each(response.list, function(numberOfEntry, entry) {
      // zeitstring wieder zusammenbauen, falls Event <> 'time', damit wir den
		// richtigen Zusammenbau im zeitstring haben
      if(entry.event === 'time'){
        // wenn der eintrag time ist, dann kommt die zeit rein
        entry.time = entry.timeCron;
      }
      else{
        // ansonsten wird er aus den Bestandteilen zusammengebaut
        entry.time = '';
        if(entry.timeMin != null && entry.timeMin.length > 0){
          entry.time += entry.timeMin + '<';
        }
        entry.time += entry.event;
        if(entry.timeOffset > 0){
          entry.time += '+' + entry.timeOffset + (entry.timeOffsetType == undefined ? '' : entry.timeOffsetType);
        }
        else if(entry.timeOffset < 0){
          entry.time += entry.timeOffset + (entry.timeOffsetType == undefined ? '' : entry.timeOffsetType);
        }
        if(entry.timeMax != null && entry.timeMax.length > 0){
          entry.time += '<' + entry.timeMax;
        }
      }

      // Clear unused properties for SmartHomeNG
      if (self.options.designtype == '0') {
        delete entry.event;
        delete entry.timeCron;
        delete entry.timeMin;
        delete entry.timeMax;
        delete entry.timeOffset;
        delete entry.timeOffsetType;
        delete entry.condition;
        delete entry.delayedExec;
        delete entry.holiday;
      }
      // Clear unused properties for FHEM
      else if (self.options.designtype == '2') {
        // delete entry.time; TODO: unsure if this is used in FHEM or not. if
		// not, the code above does not needto be executed in designType=2
      }

    });
  },
  // Kohler Start 20210703
  // Expertenzeile mit Eingaben auf der Hauptzeile benutzbar machen oder
	// sperren bzw. die Statusupdates in die Zeile eintragen
  _uzsuShowSeriesLine: function(e) {
    // erst einmal alle verschwinden lassen
    this._uzsuHideAllSeriesLines();
    // Tabellezeile ermitteln, wo augerufen wurde
    var uzsuSerieButton = $(e.currentTarget);
    var row = uzsuSerieButton.closest('.uzsuRow');
    // Zeile anzeigen
    myRow = row.nextUntil('.uzsuRow')
    myRow[0].style.display="block"
    // jetzt noch den Button einf??rben
    uzsuSerieButton.buttonMarkup({ icon: "arrow-l" });
  },  
  // Kohler Ende 20210703
  // Expertenzeile mit Eingaben auf der Hauptzeile benutzbar machen oder
	// sperren bzw. die Statusupdates in die Zeile eintragen
  _uzsuShowExpertLine: function(e) {
    // erst einmal alle verschwinden lassen
    this._uzsuHideAllExpertLines();
    // Tabellezeile ermitteln, wo augerufen wurde
    var uzsuExpertButton = $(e.currentTarget);
    var row = uzsuExpertButton.closest('.uzsuRow');
    // Zeile anzeigen
    // Kohler 20210703 - added '.uzsuRowExpHoli' as Filter
    row.nextUntil('.uzsuRow', '.uzsuRowExpHoli').show();
    // jetzt noch den Button in der Zeile dr??ber auf arrow up ??ndern
    uzsuExpertButton.buttonMarkup({ icon: "arrow-u" });
  },
  _uzsuHideAllExpertLines: function() {
    $('.uzsuRowExpHoli, .uzsuRowCondition, .uzsuRowDelayedExec').hide();
    $('.uzsuCellExpert button').buttonMarkup({ icon: "arrow-d" });
  },
  _uzsuHideAllSeriesLines: function() {
    $('.uzsuRowSeries').hide();
    $('.uzsuCellSerie button').buttonMarkup({ icon: "arrow-r" });
	  },
  // Interpolationszeile
  _uzsuShowInterpolationLine: function(e) {

    // erst einmal alle verschwinden lassen
    // this._uzsuHideInterpolationLine();
    // Tabellezeile ermitteln, wo augerufen wurde
    var uzsuInterpolationButton = $(e.currentTarget);
    $('#uzsuRowInterpolation').show();
    // jetzt noch den Button in der Zeile dr??ber auf arrow up ??ndern
    uzsuInterpolationButton.buttonMarkup({ icon: "arrow-u" });
  },
  _uzsuHideInterpolationLine: function() {
    $('#uzsuRowInterpolation').hide();
    $('.uzsuCellInterpolation button').buttonMarkup({ icon: "arrow-d" });
  }
});


