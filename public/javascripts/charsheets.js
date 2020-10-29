function generateId() {
  return Math.floor(Math.random() * 10000000000).toString(16);
}

function buildCharacterObject() {
  var $form = $("form#build-my-character");

  var game = $form.find("#game").val();
  var id = generateId();

  var character = {
    "id": id,
    "game": game,
    "print": {}
  };
  var gameOptions = {
    "classes": []
  };

  var language = $("input[type=radio][name=language]:checked").val();
  character.language = language.substr(0,2);

  // classes
  $form.find("input:checkbox[data-class]").each(function (n, input) {
    if ($(input).is(":checked")) {
      var classname = $(input).data('class');
      var cls = { "class": classname };

      var variants = [];
      if ($("select#variant-"+classname).length > 0) {
        variants = [ $("select#variant-"+classname).val() ];
      } else {
        var axis = 0;
        for (var axis = 0; axis < 10; axis++) {
          if ($("select#variant-"+classname+"-axis-"+axis).length > 0) {
            variants.push($("select#variant-"+classname+"-axis-"+axis).val());
          }
        }
      }
      if (variants.length !== 0) {
        cls.variant = variants;
      }

      gameOptions.classes.push(cls);
    }
  });

  // game options
  if ($("#include-background").is(":checked")) {
    gameOptions.includeCharacterBackground = true;
    if (game == "pathfinder" || game == "pathfinder2")
      gameOptions.characterBackgroundStyle = $("#include-pathfinder-society").is(":checked") ? "pathfinder-society" : "normal";
  }
  if ($("#include-animal-companion").is(":checked")) {
    gameOptions.includeAnimalCompanion = true;
  }
  if ($("#include-party-funds").is(":checked")) {
    gameOptions.includePartyFunds = true;
  }
  if ($("#include-lycanthrope").is(":checked")) {
    gameOptions.includeLycanthrope = true;
  }
  if ($("#include-mini").is(":checked")) {
    gameOptions.includeMini = true;
    gameOptions.miniSize = $("input[type=radio][name=mini-size]:checked").val();
  }

  switch(game) {
    case "pathfinder":
    case "dnd35":
      break;
  }
  character[game] = gameOptions;

  // print options
  if ($("input#has-watermark").is(":checked")) {
    var watermark = $("input#watermark").val();
    if (watermark != "") {
      character.print.watermark = watermark;
    }
  }

  var colour = $("input[type=radio][name=colour]:checked").val();
  // switch (colour) {
  //   case 
  // }


  // make the full request object
  var req = {
    "version": 0,
    "data": character,
    "included": []
  };

  console.log(JSON.stringify(req, 0, 4));
}

$(function() {
  $("html, body").addClass("postload");

  $("#start-single").click(function () {
    $("#class-tab-link, #options-tab-link, #download-tab-link").show();
    $("#start-tab-link, #party-tab-link, #gm-tab-link").hide();
    $("#class-tab-link").show().click();
    $("#add-to-party").hide();
    $("#party-readout").hide();
    $("#start-type").val('single');
    return false;
  });

  $("#start-party").click(function () {
    $("#class-tab-link, #options-tab-link, #party-tab-link, #download-tab-link").show();
    $("#start-tab-link, #gm-tab-link").hide();
    $("#class-tab-link").click();
    $("#party-readout").show();
    $("#add-to-party").show();
    $("#start-type").val('party');
    return false;
  });

  $("#start-starship").click(function () {
    $("#download-tab-link").show();
    $("#start-tab-link, #class-tab-link, #options-tab-link, #party-tab-link, #gm-tab-link").hide();
    $("#download-tab-link").click();
    $("#add-to-party").hide();
    $("#party-readout").hide();
    $("#start-type").val('starship');
  });

  $("#start-gm").click(function () {
    $("#gm-start-tab-link").show();
    $("#start-tab-link, #party-tab-link, #class-tab-link, #options-tab-link, #download-tab-link").hide();
    $("#gm-start-tab-link").click();
    $("#add-to-party").hide();
    $("#party-readout").hide();
    $("#start-type").val('gm');
    $("#download-tab-back-link").attr('href', '#gm-options-tab');
  });

  $("#gm-start-options a").click(function () {
    $("#gm-options-tab-link, #download-tab-link").show();
    $("#gm-options-tab-link").click();

    var rel = $(this).attr('rel');
    var gmType = $(this).data('gm-type');
    $("#gm-start-type").val(gmType);
    $(".gm-options-section").hide();
    $(rel).show();
    if (gmType == "maps" || gmType == "kingdom") {
      $("#gm-logo-section").show();
    } else {
      $("#gm-logo-section").hide();
    }
  })

  $("#start-all").click(function () {
    $("#download-tab-link").show();
    $("#start-tab-link, #class-tab-link, #options-tab-link, #party-tab-link, #gm-tab-link").hide();
    $("#download-tab-link").show().click();
    $("#add-to-party").hide();
    $("#party-readout").hide();
    $(".wizardnav").hide();
    $("#start-type").val('all');
    return false;
  });

  $("a.perform-more").click(function () {
    var copy = $("#perform-group select").first().clone();
    copy.insertAfter($("#perform-group select").last());
    $("#perform-group select").each(function (n, select) {
      $(select).attr('name', 'perform-skill-'+n);
    });
  });

  // $("a.perform-less").click(function () {

  // });

  $("a.craft-more").click(function () {
    var copy = $("#craft-group select").first().clone();
    copy.insertAfter($("#craft-group select").last());
    $("#craft-group select").each(function (n, select) {
      $(select).attr('name', 'craft-skill-'+n);
    });
  });

  $("a.profession-more").click(function () {
    var copy = $("#profession-group select").first().clone();
    copy.insertAfter($("#profession-group select").last());
    $("#profession-group select").each(function (n, select) {
      $(select).attr('name', 'profession-skill-'+n);
    });
  });

  $("#include-pathfinder-society").change(function () {
    if ($(this).is(":checked")) {
      $("#include-background").prop('checked', true);
    }
  });

  $("#simple").change(function () {
    if ($(this).is(":checked")) {
      $("#more").prop('checked', false);
    }
  });

  $("#more").change(function () {
    if ($(this).is(":checked")) {
      $("#simple").prop('checked', false);
    }
  });

  $("input[name=mini-size]").change(function () {

  });

  $("a.lightbox").click(function () {
    var id = $(this).attr('rel');
    var lightbox = $(id);
    if (lightbox) {
      var img = lightbox.find("img");
      var src = img.attr('src');
      img.attr('src', '');
      img.attr('src', src).load(function () {
        console.log("image loaded!");
        var outer = lightbox.innerHeight();
        var inner = img.outerHeight();
        var margin = (outer - inner) / 2;
        lightbox.find("> *").css("margin-top", margin+"px");
      });
      $("#blanket").fadeIn("fast");
      lightbox.fadeIn("fast");
      return false;
    }
    return true;
  });

  $("#blanket").click(function () {
    $(this).fadeOut("fast");
    $("#blanket").fadeOut("fast");
  });

  // $("div.lightbox .note").click(function () {
  //   $("#message-form").show();
  //   $("#message-ok").hide();
  //   $("#message-error").hide();
  //   return false;
  // });

  $("#message-send").click(function () {
    console.log("Sending message...");
    var form = $("#message-form");
    var message = form.find('#message').val();
    var author = form.find('#author').val();
    var email = form.find('#email').val();
    var game = form.find('input[name="game"]:checked').val();
    var validation = form.find('#validation').val();
    var verify = form.find('input[name=verify]:checked').attr('value');

    $.post('/message', {
      message: message,
      author: author,
      email: email,
      game: game,
      validation: validation,
      verify: verify
    }, function (data, status, xhr) {
      if (status == "success") {
        console.log("Message sent");
        $("#message-form").hide();
        $("#message-ok").show();
      } else {
        console.log("Error");
        $("#message-form").hide();
        $("#message-error").show();
      }
    }).fail(function () {
      console.log("Error");
      $("#message-form").hide();
      $("#message-error").show();
    });
    return false;
  });

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

  function update_character() {
    if ($("#simple-section").length) {
      if ($("#class-Barbarian, #class-Ranger, #class-Ardent, #class-Divine-Mind, #class-Lurk, #class-Psion, #class-Psychic-Warrior, #class-Soulknife, #class-Wilder").is(":checked")) {
        $("#simple-section").addClass("disabled");
        $("#simple").attr("disabled", true).removeAttr("checked");
      } else {
        $("#simple-section").removeClass("disabled");
        $("#simple").removeAttr("disabled");
      }

      if ($("#simple").is(":checked")) {
        $("#iconic-section").addClass("disabled");
        $("#inventory-iconic-set").val('default').attr("disabled", true);
      } else {
        $("#iconic-section").removeClass("disabled");
        $("#inventory-iconic-set").removeAttr("disabled");
      }

      update_iconic();
    }
  }
  $("#class-tab input, #class-tab select, #simple").change(update_character);

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
    $("#blanket, div.lightbox, .dialog").fadeOut("fast");
  });

  $("#iconic-image-list a").click(function () {
    var iconic = $(this).data("id");
    if (iconic == "custom") {
      $("#iconic-image-list > div").removeClass("selected");
      $("#iconic-image-list-custom").addClass("selected");
    } else {
      $("#inventory-iconic").val(iconic);
      $("#iconic img").removeClass("selected");
      $("#iconic-"+iconic).addClass("selected").attr('src', $("#iconic-"+iconic).data('src'));
      // close
      $("#blanket, #download-thanks-dialog, #iconic-select-dialog").fadeOut("fast");
    }
  });

  $("#iconic-custom-file-ok-button").click(function () {
    $("#inventory-iconic").val("custom");
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
    var logo = $(this).data("id");
    if (logo == "custom") {
      $("#logo-list > div").removeClass("selected");
      $("#logo-list-custom").addClass("selected");
    } else {
      $("#logo-select").val(logo);
      $("#logo img, #gm-logo img").removeClass("selected");
      $("#logo-"+logo+", #gm-logo-"+logo).addClass("selected");
      // close
      $("#blanket, #logo-select-dialog").fadeOut("fast");
    }
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


  $("#build-my-character").submit(function () {
    buildCharacterObject();
    return;
  });



  var nextcharid = 1;
  $("#add-to-party").click(function () {
    var form = $("#build-my-character");
    var inputs = form.find("input").not("[data-charid]");
    var charid = nextcharid; nextcharid++;

    // collect all the character data
    var chardata = {};
    inputs.each(function () {
      var input = $(this);
      if (input.attr('type') == 'radio' && !input.is(":checked")) {
        return;
      }
      var name = input.attr('name');
      var value = input.attr('value');
      if (input.attr('type') == 'checkbox') {
        value = input.is(":checked") ? "on" : "";
      }
      chardata[name] = value;
    });

    // store the data in hidden fields
    for (name in chardata) {
      var value = chardata[name];
      $("<input type='hidden' name='char-"+charid+"-"+name+"' data-charid='"+charid+"' />").val(value).appendTo(form);
    }

    // interpret the data
    var classes = [];
    for (name in chardata) {
      if (name.slice(0, 6) == 'class-' && chardata[name] == 'on') {
        classes.push(name.slice(6));
      }
    }

    // add the character to the list
    var readout = $("#party-readout ul");
    var img = $("#inventory-iconic").val();
    var imgsrc = $("#iconic-"+img).attr('src');
    $("<li><img src='"+imgsrc+"'/><span>"+classes.join(", ")+"</span></li>").appendTo(readout);
    var charids = $("#charids");
    var ids = charids.val().split(",");
    ids.push(charid);
    charids.val(ids.join(","));

    // reset the data
    $("#class-tab input[type=checkbox]").prop("checked", false);
    $("#iconic img").removeClass("selected");
    $("#iconic-generic").addClass("selected");
    $("#inventory-iconic").val("generic");

    // move along
    $("#party-tab-link").click();
  });

  $("#build-my-character").submit(function () {/*
    var path = "";
    $("#class-tab input:checkbox:checked").each(function () {
      var name = $(this).data('classname');

      $("#variant-"+code+" option:selected").each(function () {
        name = $(this).attr('value');
      })

      path = path+"/"+name;
    });

    var url = "https://flattr.com/submit/auto?user_id=marcusdowning&url=http://charactersheets.minotaur.cc"+path;
    $("a#flattr").attr('href', url);*/

    $("#blanket, #download-thanks-dialog").fadeIn("fast");

    // Google Analytics download tracking
    var url = $("#build-my-character").attr('action');
    ga('send', 'pageview', url);

    // Google Analytics custom event tracking
    var game = $("#start-tab-title").text();
    var language = $("input[type='radio'][name='language']:checked").val();
    var classes = $("#class-fields input[type='checkbox']:checked").map(function(){
      return $(this).data('classname');
    }).get();
    var className = '';
    if ($.isArray(classes)) className = classes.join(", ");
    var colour = $("input[type='radio'][name='colour']:checked").val();

    var fields = {
      'Game': game,
      'Language': language,
      'Class': classes,
      'Colour': colour
    };

    ga('set', fields);
    ga('send', 'event', 'Download', game, className, fields);
  });

  $("#close").click(function () {
    $("#blanket, #download-thanks-dialog, #iconic-select-dialog").fadeOut("fast");
  });

  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      $("#blanket, #download-thanks-dialog, #iconic-select-dialog").fadeOut("fast");
    }
  });
});

/*
    window._idl = {};
    _idl.variant = "banner";
    (function() {
        var idl = document.createElement('script');
        idl.type = 'text/javascript';
        idl.async = true;
        idl.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'members.internetdefenseleague.org/include/?url=' + (_idl.url || '') + '&campaign=' + (_idl.campaign || '') + '&variant=' + (_idl.variant || 'banner');
        document.getElementsByTagName('body')[0].appendChild(idl);
    })();
*/