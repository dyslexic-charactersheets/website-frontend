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

$("#build-my-character").submit(function (e) {
  e.preventDefault();

  var char = {
    "version": 0,
    "data": {
      "type": "character",
      "id": generateId(),
      "attributes": {
        "game": "pathfinder2",
        "name": "",
        "language": "en-US",
        "ancestry": "",
        "class": "",
        "archetypes": [],
        "optionPermission": false,
        "optionBuild": false,
        "printColour": "#808080",
        "accentColour": "#808080",
        "printLogo": "logos/pathfinder2e.png",
        "printPortrait": "",
        "printBackground": ""
      }
    }
  };

  // selectable things
  var ancestry = char.data.attributes.ancestry = $("input[type=radio][name=ancestry]:checked").attr("value");
  var heritage = char.data.attributes.heritage = $("input[type=radio][name='heritage-"+ancestry+"']:checked").attr("value");
  
  var background = char.data.attributes.background = $("input[type=radio][name=background]:checked").attr("value");
  
  var cls = char.data.attributes.class = $("input[type=radio][name=class]:checked").attr("value");
  var subclasses = unique($("#reveal-subclass-"+cls+" input[type=radio]").map(function (i, elem) { return $(elem).attr("name"); }).get());
  subclasses.forEach(subclass => {
    var attrib = kebab2camel("class-"+subclass);
    char.data.attributes[attrib] = $("input[type=radio][name='"+subclass+"']").attr("value");
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

  // backgrounds
  char.data.attributes.printBackground = $("input[type=radio][name=print-background]:checked").attr('value');

  char.data.attributes.printWatermark = $("input#watermark").val();

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


