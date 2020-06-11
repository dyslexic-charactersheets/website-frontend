function generateId() {
    return Math.floor(Math.random() * 10000000000).toString(16);
}

function unique(array) {
  return $.grep(array, function(el, index) {
      return index === $.inArray(el, array);
  });
}

function kebab2camel(str) {
  var words = str.split(/-/);
  words = words.map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase());
  words[0] = words[0].toLowerCase();
  return words.join("");
}

function initial(str) {
  var letters = str.split('');
  return letters[0].toUpperCase() + str.substr(1);
}

function colourFromName(colour) {
  switch(colour) {
    case 'none':      return '';
    case 'black':     return '#404040';

    case 'red':       return '#BF4C4C';
    case 'orange':    return '#CC843D';
    case 'gold':      return '#CCAF1F';
    case 'lime':      return '#76A632';
    case 'green':     return '#42A642';
    case 'teal':      return '#3AA66E';
    case 'cyan':      return '#32A6A6';
    case 'azure':     return '#3F78B3';
    case 'blue':      return '#4848B3';
    case 'indigo':    return '#793FB3';
    case 'violet':    return '#B33FB3';
    case 'magenta':   return '#B33F7A';

    case 'red2':      return '#BF6969';
    case 'orange2':   return '#BF8A56';
    case 'gold2':     return '#CCB952';
    case 'lime2':     return '#91B362';
    case 'green2':    return '#6BB36B';
    case 'teal2':     return '#62B389';
    case 'cyan2':     return '#74B3B3';
    case 'azure2':    return '#6993BF';
    case 'blue2':     return '#7373BF';
    case 'indigo2':   return '#9469BF';
    case 'violet2':   return '#BF69BF';
    case 'magenta2':  return '#BF6994';

    default:          return colour;
  }
}

// Colour functions from: 
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
      h = s = 0; // achromatic
  }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }

  return [h, s, l];
}

/**
* Converts an HSL color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes h, s, and l are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
*
* @param   Number  h       The hue
* @param   Number  s       The saturation
* @param   Number  l       The lightness
* @return  Array           The RGB representation
*/
function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255];
}

function hex(num) {
  var hex = num.toString(16).replace(/\..*$/, '');
  hex = '00'+hex;
  return hex.substring(hex.length - 2);
}

function adjustIntensity(colour, intensity) {
  colour = colourFromName(colour);

  var factor = 0;
  switch (intensity) {
    case 'lightest': factor = 2; break;
    case 'lighter': factor = 1; break;
    case 'darker': factor = -1; break;
    case 'darkest': factor = -2; break;
    default: return colour;
  }

  var r = parseInt(colour.substr(1, 2), 16);
  var g = parseInt(colour.substr(3, 2), 16);
  var b = parseInt(colour.substr(5, 2), 16);

  var [h, s, l] = rgbToHsl(r, g, b);
  l += factor * 0.15;
  if (l < 0) l = 0;
  if (l > 1) l = 1;
  [r, g, b] = hslToRgb(h, s, l);

  colour = '#'+hex(r)+hex(g)+hex(b);
  return colour;
}


var portraitData = null;
var animalData = null;
var logoData = null;


function imageAttachment(id, data) {
  var m = data.match(/data:(image\/.*?);base64,(.*)$/);
  if (m) {
    var mimeType = m[1];
    var data = m[2];

    return {
      type: "image",
      id: id,
      attributes: {
        mimeType: mimeType,
        data: data
      }
    };
  }

  return null;
}


function quickLink(quick) {
  return {
    version: 0,
    data: {
      type: 'quick',
      id: generateId(),
      attributes: {
        "game": "pathfinder2",
        "quick": quick
      }
    }
  };
}

$("#quick-link-build").click(function (e) {
  e.preventDefault();
  var char = quickLink('build');

  var requestData = JSON.stringify(char);
  $("#pf2-form #request").val(requestData);
  $("#pf2-form").submit();
  return false;
});


$("#build-my-character").submit(function (e) {
  e.preventDefault();

  var char = {
    version: 0,
    data: {
      type: "character",
      id: generateId(),
      attributes: {
        game: "pathfinder2",
        name: "",
        description: "",
        language: "en",
        ancestry: "",
        heritage: "",
        background: "",
        class: "",
        archetypes: [],
        feats: [],

        optionPermission: false,
        optionBuild: false,

        printLarge: false,
        printHighContrast: false,
        printDyslexic: false,
        
        printColour: "#808080",
        accentColour: "#808080",
        printLogo: "logos/pathfinder2e.png",
        printPortrait: "",
        animalPortraint: "",
        printBackground: ""
      }
    }
  };
  var charIncluded = [];

  char.data.attributes.name = $("input#character-name").val();
  char.data.attributes.description = $("input#character-description").val();
  char.data.attributes.language = $("input[type=radio][name=language]:checked").attr("value");

  // selectable things
  char.data.ancestry = char.data.attributes.ancestry = $("input[type=radio][name=ancestry]:checked").attr("value");
  char.data.heritage = char.data.attributes.heritage = $("input[type=radio][name='heritage-"+char.data.ancestry+"']:checked").attr("value");
  
  // char.data.background = char.data.attributes.background = $("input[type=radio][name=background]:checked").attr("value");
  char.data.background = char.data.attributes.background = $("select#background option:selected").attr("value");
  
  var cls = char.data.attributes.class = $("input[type=radio][name=class]:checked").attr("value");
  var subclasses = unique($("#reveal-subclass-"+cls+" input[type=radio]").map(function (i, elem) { return $(elem).attr("name"); }).get());
  subclasses.forEach(subclass => {
    var attrib = kebab2camel("class-"+subclass);
    char.data.attributes[attrib] = $("input[type=radio][name='"+subclass+"']:checked").attr("value");
  });
  var classOptions = unique($("#reveal-subclass-"+cls+" input[type=checkbox]").map(function (i, elem) { return $(elem).data("class-option"); }).get());
  classOptions.forEach(classOption => {
    var attrib = kebab2camel("class-"+classOption);
    var opts = [];
    $("input[type=checkbox][data-class-option='"+classOption+"']:checked").each(function (i, input) {
      opts.push($(input).attr("name"));
    });
    char.data.attributes[attrib] = opts;
  });

  // $("input[type=checkbox][name^=option-]").each(function (input) {
  //   var opt = $(input).attr('name');
  //   char.data.attributes[opt] = $(input).is(':checked');
  // });

  $("input[type=radio][name=archetypes]:checked").each(function (i, input) {
    char.data.attributes.archetypes.push($(input).attr('value'));
  });


  if ($("#option-minis").is(':checked')) {
    char.data.attributes.miniSize = $("input[type=radio][name=mini-size]:checked").attr('value');
  }
  char.data.attributes.skillActions = $("#skill-actions").is(":checked");

  // colours
  var intensity = $("input[type=radio][name=intensity]:checked").attr('value');
  var printIntensity = 0;
  switch (intensity) {
    case 'lightest': printIntensity = 2; break;
    case 'lighter': printIntensity = 1; break;
    case 'darker': printIntensity = -1; break;
    case 'darkest': printIntensity = -2; break;
  }
  char.data.attributes.printIntensity = printIntensity;

  var colour = $("input[type=radio][name=print-colour]:checked").attr('value');
  if (colour == "custom")
    colour = "#"+$("input[name=print-colour-custom]").val();
  else
    colour = colourFromName(colour);
  // colour = adjustIntensity(colour, intensity);
  char.data.attributes.printColour = colour;

  var accentColour = $("input[type=radio][name=accent-colour]:checked").attr('value');
  if (accentColour == "custom")
    accentColour = "#"+$("input[name=accent-colour-custom]").val();
  // accentColour = adjustIntensity(accentColour, intensity);
  char.data.attributes.accentColour = colourFromName(accentColour);

  if ($("input#option-high-contrast").is(":checked")) {
    char.data.attributes.printHighContrast = true;
  }
  // backgrounds
  char.data.attributes.printBackground = $("input[type=radio][name=print-background]:checked").attr('value');
  char.data.attributes.printWatermark = $("input#watermark").val();

  // options
  if ($("input#option-large-print").is(":checked")) {
    char.data.attributes.printLarge = true;
  }
  if ($("input#option-dyslexic").is(":checked")) {
    char.data.attributes.printDyslexic = true;
  }

  if ($("input#underlay-no").is(":checked")) {
    char.data.attributes.optionNoUnderlay = true;
  }

  // char.data.attributes.inventoryStyle = $("input[type=radio][name='inventory-style']:checked").attr('value');
  char.data.attributes.inventoryStyle = $("#inventory-style option:selected").attr('value');
  char.data.attributes.classKit = $("#inventory-class-kit").is(":checked");

  $("input[type=checkbox][id^='option-']").each(function (n, cb) {
    var prop = $(cb).attr('id');
    prop = kebab2camel(prop);
    var checked = $(cb).is(':checked');
    char.data.attributes[prop] = checked;
  });

  var classFeatsKey = "class"+initial(char.data.attributes.class)+"Feats";
  char.data.attributes[classFeatsKey] = [];
  var classFeatsPrefix = "feat-"+char.data.attributes.class+'-';
  $("input[type=checkbox][id^='feat-']").each(function (n, cb) {
    var prop = $(cb).attr('id');
    var checked = $(cb).is(':checked');
    if (checked) {
      if (prop.startsWith(classFeatsPrefix)) {
        prop = prop.replace(classFeatsPrefix, '');
        // prop = kebab2camel(prop);
        char.data.attributes[classFeatsKey].push(prop);
      } else {
        prop = prop.replace('feat-', '');
        // prop = kebab2camel(prop);
        char.data.attributes.feats.push(prop);
      }
    }
  });

  // images
  var portrait = $("input#iconic-portrait").val();
  if (portrait == "custom") {
    var portraitID = generateId();
    var attachment = imageAttachment(portraitID, portraitData);
    char.data.attributes.printPortrait = portraitID;
    charIncluded.push(attachment);
  } else {
    char.data.attributes.printPortrait = portrait;
  }

  var animal = $("input#animal-portrait").val();
  if (animal == "custom") {
    var animalID = generateId();
    var attachment = imageAttachment(animalID, animalData);
    char.data.attributes.animalPortraint = animalID;
    charIncluded.push(attachment);
  } else {
    char.data.attributes.animalPortraint = animal;
  }

  var logo = $("input#logo-select").val();
  if (logo == "custom") {
    var logoID = generateId();
    var attachment = imageAttachment(logoID, logoData);
    char.data.attributes.printLogo = logoID;
    charIncluded.push(attachment);
  } else {
    char.data.attributes.printLogo = logo;
  }

  // html or pdf
  var downloadFormat = $("input[name=download-format]:checked").attr('value');
  char.data.attributes.downloadPDF = downloadFormat == "pdf";
  char.data.attributes.downloadPaperSize = $("input[name=download-paper]:checked").attr('value');

  // marshal and send
  if (charIncluded.length > 0) {
    char.included = charIncluded;
  }

  // debug
  if ($("#debug").is(':checked')) {
    char.data.debug = true;
  }

  var requestData = JSON.stringify(char);
  $("#pf2-form #request").val(requestData);
  $("#pf2-form").submit();
  return false;
});



$(function() {
    $("html, body").addClass("postload");

    // tabs
    $("nav.tabs a").click(function () {
        var rel = $(this).attr('rel');
        var target = $(rel);
        if (target.is("section.tab")) {
            // show the tab pane
            $("section.tab").removeClass('selected');
            target.addClass('selected');

            // select the tab label
            $("nav.tabs a").removeClass('selected');
            $(this).addClass('selected');

            return false;
        }
        return true;
    });

    $("a[href^='#']").click(function () {
        var href = $(this).attr('href');
        var target = $(href);
        if (target.is("section.tab")) {
            // show the tab pane
            $("section.tab").removeClass('selected');
            target.addClass('selected');

            // select the tab label
            $("nav.tabs a").removeClass('selected');
            $("nav.tabs a[rel='"+href+"']").addClass('selected');

            // april fool
            if ($("body").is(".april-fool") && cornify_add && Math.random() > 0.8) {
            cornify_add();
            }
            return false;
        }
        return true;
    });

    $("input[type=radio][name=ancestry]").change(function () {
      $(".reveal-heritage").removeClass("reveal-show");
      ancestry = $("input[type=radio][name=ancestry]:checked").attr('value');
      $("#reveal-heritage-"+ancestry).addClass("reveal-show");
    });

    $("input[type=radio][name=class]").change(function () {
      $(".reveal-subclass").removeClass("reveal-show");
      cls = $("input[type=radio][name=class]:checked").attr('value');
      $("#reveal-subclass-"+cls).addClass("reveal-show");
    });


    // colour appearance
    // $("#option-high-contrast").change(function () {
    //   if ($("#option-high-contrast").is(':checked')) {
    //     $("#colour-row, #background-area").hide();
    //   } else {
    //     $("#colour-row, #background-area").show();
    //   }
    // });
    
    
    // iconics
    $("#select-iconic-button").click(function () {
      $("#blanket, #iconic-select-dialog").fadeIn("fast");
    });

    $(".set-list a").click(function () {
      var setId = $(this).data('set-id');
      var setList = $(this).closest('.set-list');
      var imageList = $(this).closest('.select-dialog').find('.image-list');
      setList.find("a").removeClass("selected");
      $(this).addClass("selected");
      imageList.find("> div").removeClass("selected");
      $("#"+setId).addClass("selected");
      $("#"+setId+" img").each(function () {
        $(this).attr("src", $(this).data("src"));
      });
    });

    $(".dialog-close").click(function () {
      $("#blanket, .dialog").fadeOut("fast");
    });

    $("#iconic-image-list a").click(function () {
      var iconicId = $(this).data("id");
      var iconicPath = $(this).data("value");

      $("#iconic-portrait").val(iconicPath);
      $("#iconic img").removeClass("selected");
      $("#iconic-"+iconicId).addClass("selected").attr('src', $("#iconic-"+iconicId).data('src'));
      // close
      $("#blanket, #download-thanks-dialog, #iconic-select-dialog").fadeOut("fast");
    });

    $("#iconic-custom-file-ok-button").click(function () {
      $("#iconic-portrait").val("custom");
      $("#iconic img").removeClass("selected");
      $("#iconic-custom").addClass("selected");
      $("#blanket, #iconic-select-dialog").fadeOut("fast");
    });

    $("#iconic-custom-file-cancel-button").click(function () {
      $("#blanket, #iconic-select-dialog").fadeOut("fast");
    });

    // logos
    $("#select-logo-button, #select-gm-logo-button").click(function () {
      $("#blanket, #logo-select-dialog").fadeIn("fast");
    });

    $("#logo-list a").click(function () {
      var logoId = $(this).data("id");
      var logoPath = $(this).data("value");
      
      $("#logo-select").val(logoPath);
      $("#logo img, #gm-logo img").removeClass("selected");
      $("#logo-"+logoId+", #gm-logo-"+logoId).addClass("selected");
      // close
      $("#blanket, #logo-select-dialog").fadeOut("fast");
    });

    $("#logo-custom-file-ok-button").click(function () {
      $("#logo-select").val("custom");
      $("#logo img").removeClass("selected");
      $("#logo-custom").addClass("selected");
      $("#blanket, #logo-select-dialog").fadeOut("fast");
    });

    $("#logo-custom-file-cancel-button").click(function () {
      $("#blanket, #logo-select-dialog").fadeOut("fast");
    });



    // portrait and logo drag-and-drop images
    $(".well-drop-zone").on('dragover', function (e){
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('drag-ready');
        console.log("Drag on");
    }).on('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-ready');
        console.log("Drag off");
    }).on('drop', function (e){
        e.preventDefault();
        e.stopPropagation();
        var $self = $(this);
        $self.removeClass('drag-ready');

        var files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
          var file = files[0];
          switch (file.type) {
            case 'image/png':
            case 'image/jpeg':
              var reader = new FileReader();
              reader.onload = function(e) {
                var data = e.target.result;
                console.log("I have data!");

                $self.find("img").removeClass('selected');
                $self.find("img.custom").addClass('selected').attr('src', data);

                switch ($self.attr('id')) {
                  case 'iconic': portraitData = data; $("#iconic-portrait").val("custom"); break;
                  case 'animal': animalData = data;   $("#animal-portrait").val("custom"); break;
                  case 'logo':   logoData = data;     $("#logo-select").val("custom");     break;
                }
              }
              reader.readAsDataURL(file);

              break;
          }
        }
    });


    $("input[name=print-colour-custom]").keyup(function () {
      $("input[name=print-colour][value=custom]").prop('checked', true);
      var colour = "#"+$("input[name=print-colour-custom]").val();
      $("#print-colour-custom-preview").removeClass('colour-sample-rainbow').find("span").css('background-color', colour);
    });
    $("input[name=accent-colour-custom]").keyup(function () {
      $("input[name=accent-colour][value=custom]").prop('checked', true);
      var colour = "#"+$("input[name=accent-colour-custom]").val();
      $("#accent-colour-custom-preview").removeClass('colour-sample-rainbow').find("span").css('background-color', colour);
    });


    // turn the colour wheel into an image map
    // this gets a bit funky because we're crossing from one DOM into another
    document.getElementById("colour-wheel-svg").addEventListener('load', function () {
        var wheel = $(document.getElementById("colour-wheel-svg").contentDocument);
        wheel.find("[id=grey]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-grey").prop('checked', true); });

        wheel.find("[id=red]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-red").prop('checked', true); });
        wheel.find("[id=orange]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-orange").prop('checked', true); });
        wheel.find("[id=gold]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-gold").prop('checked', true); });
        wheel.find("[id=lime]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-lime").prop('checked', true); });
        wheel.find("[id=green]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-green").prop('checked', true); });
        wheel.find("[id=teal]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-teal").prop('checked', true); });
        wheel.find("[id=cyan]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-cyan").prop('checked', true); });
        wheel.find("[id=azure]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-azure").prop('checked', true); });
        wheel.find("[id=blue]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-blue").prop('checked', true); });
        wheel.find("[id=indigo]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-indigo").prop('checked', true); });
        wheel.find("[id=violet]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-violet").prop('checked', true); });
        wheel.find("[id=magenta]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-magenta").prop('checked', true); });
        
        wheel.find("[id=red2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-red2").prop('checked', true); });
        wheel.find("[id=orange2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-orange2").prop('checked', true); });
        wheel.find("[id=gold2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-gold2").prop('checked', true); });
        wheel.find("[id=lime2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-lime2").prop('checked', true); });
        wheel.find("[id=green2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-green2").prop('checked', true); });
        wheel.find("[id=teal2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-teal2").prop('checked', true); });
        wheel.find("[id=cyan2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-cyan2").prop('checked', true); });
        wheel.find("[id=azure2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-azure2").prop('checked', true); });
        wheel.find("[id=blue2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-blue2").prop('checked', true); });
        wheel.find("[id=indigo2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-indigo2").prop('checked', true); });
        wheel.find("[id=violet2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-violet2").prop('checked', true); });
        wheel.find("[id=magenta2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-magenta2").prop('checked', true); });
        
    });
});


