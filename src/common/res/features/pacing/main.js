function ynabEnhancedFormatCurrency(e, html) {
  var n, r, a;
  e = ynab.formatCurrency(e);
  n = ynab.YNABSharedLib.currencyFormatter.getCurrency();
  a = Ember.Handlebars.Utils.escapeExpression(n.currency_symbol);
  if (html) {
      a = "<bdi>" + a + "</bdi>";
  }
  n.symbol_first ? (r = "-" === e.charAt(0), e = r ? "-" + a + e.slice(1) : a + e) : e += a;
  return new Ember.Handlebars.SafeString(e);
}

// Calculate the proportion of the month that has been spent -- only works for the current month
function timeSpent() {
  var today = new Date();
  var daysInMonth = new Date(today.getYear(), today.getMonth(), 0).getDate();
  var day = today.getDate();

  return day/daysInMonth;
}

// Determine whether the selected month is the current month
function inCurrentMonth() {
  var today = new Date();
  var selectedMonth = new Date($('.budget-header-calendar-date-button').text());
  return selectedMonth.getMonth() == today.getMonth() && selectedMonth.getYear() == today.getYear();
}

(
 function addPacingColumnToBudget() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined' && typeof $ !== 'undefined') {
    if(inCurrentMonth()) {
      // Make room for the column
      $('#ynab-toolkit-pacing-style').remove();
      $("<style type='text/css' id='ynab-toolkit-pacing-style'> .budget-table-cell-available { width: 10% !important; } </style>").appendTo("head");
    } else {
      $('#ynab-toolkit-pacing-style').remove();
      $("<style type='text/css' id='ynab-toolkit-pacing-style'> .budget-table-cell-pacing { display: none; } </style>").appendTo("head");
    }


    $('.budget-table-cell-pacing').remove()
    
    $('.budget-table-header .budget-table-cell-available').after($("<li class='budget-table-cell-pacing'><strong>PACING</strong></li>"));
    
    $('.budget-table-row').each(function(){ 
      var available = parseFloat($(this).find('.budget-table-cell-available').text().replace("$","").replace(",","")); 
      var activity = -parseFloat($(this).find('.budget-table-cell-activity').text().replace("$","").replace(",","")); 
      var budgeted = available+activity;
      var burned = activity/budgeted;
      var pace = burned/timeSpent();
    
      var displayType = "dollars";
      if(displayType == "percentage") {
        if(pace > 1.25) {
          var temperature = "hot";
        } else if(pace > .75) {
          var temperature = "warm";
        } else {
          var temperature = "cool";
        }
        if(!isFinite(pace)) {
          var display = 999;
        } else {
          var display = Math.max(0,Math.round(pace*100));
        }
        if(pace > 0) {
          $(this).append("<li class='budget-table-cell-pacing'><span class='budget-table-cell-pacing-display "+temperature+"'>"+display+"%</span></li>");
        }
      } else if (displayType == "dollars") {
        display = Math.round((budgeted*timeSpent()-activity)*1000);
        if(pace > 1.25) {
          var temperature = "hot";
        } else if(pace > 1) {
          var temperature = "warm";
        } else if(activity > 0) {
          var temperature = "cool";
        } else {
          var temperature = "neutral";
        }
        if(display >= 0) {
          var tooltip = "You have spent "+ynabEnhancedFormatCurrency(display, true)+" less than your available budget for this category "+Math.round(timeSpent()*100)+"% of the way through the month.";
        } else if(display < 0) {
          var tooltip = "You have spent "+(ynabEnhancedFormatCurrency(-display), false)+" more than your available budget for this category "+Math.round(timeSpent()*100)+"% of the way through the month.";
        }
        $(this).append("<li class='budget-table-cell-pacing'><span title='"+tooltip+"' class='budget-table-cell-pacing-display "+temperature+"'>"+ynabEnhancedFormatCurrency(display, true)+"</span></li>");
      }
    });

  }

  setTimeout(addPacingColumnToBudget, 500);
})();
