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

function colourFromName(colour) {
  switch(colour) {
    case 'none':      return '';

    case 'red':       return '#BF4C4C';
    case 'orange':    return '#CC843D';
    case 'yellow':    return '#D9D941';
    case 'lime':      return '#6CA632';
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
    case 'yellow2':   return '#CCCC66';
    case 'lime2':     return '#89B362';
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
        language: "en-US",
        ancestry: "",
        class: "",
        archetypes: [],

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

  // selectable things
  var ancestry = char.data.attributes.ancestry = $("input[type=radio][name=ancestry]:checked").attr("value");
  var heritage = char.data.attributes.heritage = $("input[type=radio][name='heritage-"+ancestry+"']:checked").attr("value");
  
  var background = char.data.attributes.background = $("input[type=radio][name=background]:checked").attr("value");
  
  var cls = char.data.attributes.class = $("input[type=radio][name=class]:checked").attr("value");
  var subclasses = unique($("#reveal-subclass-"+cls+" input[type=radio]").map(function (i, elem) { return $(elem).attr("name"); }).get());
  subclasses.forEach(subclass => {
    var attrib = kebab2camel("class-"+subclass);
    char.data.attributes[attrib] = $("input[type=radio][name='"+subclass+"']:checked").attr("value");
  });

  $("input[type=radio][name=archetypes]:checked").each(function (input) {
    char.data.attributes.archetypes.push($(input).attr('value'));
  });

  // colours
  var colour = $("input[type=radio][name=print-colour]:checked").attr('value');
  if (colour == "custom")
    colour = $("input#custom-colour").val();
  else
    colour = colourFromName(colour);
  char.data.attributes.printColour = colour;

  var accentColour = $("input[type=radio][name=accent-colour]:checked").attr('value');
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

  $("input[type=checkbox][id^='option-']").each(function (n, cb) {
    var prop = $(cb).attr('id');
    prop = kebab2camel(prop);
    var checked = $(cb).is(':checked');
    char.data.attributes[prop] = checked;
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

  // marshal and send
  if (charIncluded.length > 0) {
    char.included = charIncluded;
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


    // turn the colour wheel into an image map
    // this gets a bit funky because we're crossing from one DOM into another
    document.getElementById("colour-wheel-svg").addEventListener('load', function () {
        var wheel = $(document.getElementById("colour-wheel-svg").contentDocument);
        wheel.find("[id=grey]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-grey").prop('checked', true); });

        wheel.find("[id=red]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-red").prop('checked', true); });
        wheel.find("[id=orange]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-orange").prop('checked', true); });
        wheel.find("[id=yellow]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-yellow").prop('checked', true); });
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
        wheel.find("[id=yellow2]").click(function () { $("input[type=radio][name='print-colour']").prop('checked', false); $("#colour-wheel-yellow2").prop('checked', true); });
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


