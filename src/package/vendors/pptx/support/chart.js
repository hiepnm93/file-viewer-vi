import d3 from 'd3'
import $ from 'jquery'

/**
 * 显示图表
 */
export const displayChart = charts => {
  processMsgQueue(charts.MsgQueue)
  setNumericBullets($('.block'))
  setNumericBullets($('table td'))
}

function processMsgQueue(queue) {
  queue.forEach(queue => processSingleMsg(queue?.data))
}

function processSingleMsg(d) {
  if (!d) return

  const chartID = d.chartID
  const chartType = d.chartType
  const chartData = d.chartData

  let data = []
  let chart = null
  switch (chartType) {
    case 'lineChart':
      data = chartData
      chart = nv.models.lineChart()
        .useInteractiveGuideline(true)
      chart.xAxis.tickFormat(function(d) {
        return chartData[0].xlabels[d] || d
      })
      break
    case 'barChart':
      data = chartData
      chart = nv.models.multiBarChart()
      chart.xAxis.tickFormat(function(d) {
        return chartData[0].xlabels[d] || d
      })
      break
    case 'pieChart':
    case 'pie3DChart':
      if (chartData.length > 0) {
        data = chartData[0].values
      }
      chart = nv.models.pieChart()
      break
    case 'areaChart':
      data = chartData
      chart = nv.models.stackedAreaChart()
        .clipEdge(true)
        .useInteractiveGuideline(true)
      chart.xAxis.tickFormat(function(d) {
        return chartData[0].xlabels[d] || d
      })
      break
    case 'scatterChart':

      for (var i = 0; i < chartData.length; i++) {
        var arr = []
        for (var j = 0; j < chartData[i].length; j++) {
          arr.push({ x: j, y: chartData[i][j] })
        }
        data.push({ key: 'data' + (i + 1), values: arr })
      }

      //data = chartData;
      chart = nv.models.scatterChart()
        .showDistX(true)
        .showDistY(true)
        .color(d3.scale.category10().range())
      chart.xAxis.axisLabel('X').tickFormat(d3.format('.02f'))
      chart.yAxis.axisLabel('Y').tickFormat(d3.format('.02f'))
      break
    default:
  }

  if (chart !== null) {

    d3.select(`#${chartID}`)
      .append('svg')
      .datum(data)
      .transition()
      .duration(500)
      .call(chart)

    nv.utils.windowResize(chart.update)
  }

}

function setNumericBullets(elem) {
  var prgrphs_arry = elem
  for (var i = 0; i < prgrphs_arry.length; i++) {
    var buSpan = $(prgrphs_arry[i]).find('.numeric-bullet-style')
    if (buSpan.length > 0) {
      //console.log("DIV-"+i+":");
      var prevBultTyp = ''
      var prevBultLvl = ''
      var buletIndex = 0
      var tmpArry = new Array()
      var tmpArryIndx = 0
      var buletTypSrry = new Array()
      for (var j = 0; j < buSpan.length; j++) {
        var bult_typ = $(buSpan[j]).data('bulltname')
        var bult_lvl = $(buSpan[j]).data('bulltlvl')
        //console.log(j+" - "+bult_typ+" lvl: "+bult_lvl );
        if (buletIndex == 0) {
          prevBultTyp = bult_typ
          prevBultLvl = bult_lvl
          tmpArry[tmpArryIndx] = buletIndex
          buletTypSrry[tmpArryIndx] = bult_typ
          buletIndex++
        } else {
          if (bult_typ == prevBultTyp && bult_lvl == prevBultLvl) {
            prevBultTyp = bult_typ
            prevBultLvl = bult_lvl
            buletIndex++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bult_typ
          } else if (bult_typ != prevBultTyp && bult_lvl == prevBultLvl) {
            prevBultTyp = bult_typ
            prevBultLvl = bult_lvl
            tmpArryIndx++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bult_typ
            buletIndex = 1
          } else if (bult_typ != prevBultTyp && Number(bult_lvl) > Number(prevBultLvl)) {
            prevBultTyp = bult_typ
            prevBultLvl = bult_lvl
            tmpArryIndx++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bult_typ
            buletIndex = 1
          } else if (bult_typ != prevBultTyp && Number(bult_lvl) < Number(prevBultLvl)) {
            prevBultTyp = bult_typ
            prevBultLvl = bult_lvl
            tmpArryIndx--
            buletIndex = tmpArry[tmpArryIndx] + 1
          }
        }
        //console.log(buletTypSrry[tmpArryIndx]+" - "+buletIndex);
        var numIdx = getNumTypeNum(buletTypSrry[tmpArryIndx], buletIndex)
        $(buSpan[j]).html(numIdx)
      }
    }
  }
}

function getNumTypeNum(numTyp, num) {
  var rtrnNum = ''
  switch (numTyp) {
    case 'arabicPeriod':
      rtrnNum = num + '. '
      break
    case 'arabicParenR':
      rtrnNum = num + ') '
      break
    case 'alphaLcParenR':
      rtrnNum = alphaNumeric(num, 'lowerCase') + ') '
      break
    case 'alphaLcPeriod':
      rtrnNum = alphaNumeric(num, 'lowerCase') + '. '
      break

    case 'alphaUcParenR':
      rtrnNum = alphaNumeric(num, 'upperCase') + ') '
      break
    case 'alphaUcPeriod':
      rtrnNum = alphaNumeric(num, 'upperCase') + '. '
      break

    case 'romanUcPeriod':
      rtrnNum = romanize(num) + '. '
      break
    case 'romanLcParenR':
      rtrnNum = romanize(num) + ') '
      break
    case 'hebrew2Minus':
      rtrnNum = hebrew2Minus.format(num) + '-'
      break
    default:
      rtrnNum = num
  }
  return rtrnNum
}

function romanize(num) {
  if (!+num)
    return false
  var digits = String(+num).split(''),
    key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
      '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
      '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
    roman = '',
    i = 3
  while (i--)
    roman = (key[+digits.pop() + (i * 10)] || '') + roman
  return Array(+digits.join('') + 1).join('M') + roman
}

var hebrew2Minus = archaicNumbers([
  [1000, ''],
  [400, 'ת'],
  [300, 'ש'],
  [200, 'ר'],
  [100, 'ק'],
  [90, 'צ'],
  [80, 'פ'],
  [70, 'ע'],
  [60, 'ס'],
  [50, 'נ'],
  [40, 'מ'],
  [30, 'ל'],
  [20, 'כ'],
  [10, 'י'],
  [9, 'ט'],
  [8, 'ח'],
  [7, 'ז'],
  [6, 'ו'],
  [5, 'ה'],
  [4, 'ד'],
  [3, 'ג'],
  [2, 'ב'],
  [1, 'א'],
  [/יה/, 'ט״ו'],
  [/יו/, 'ט״ז'],
  [/([א-ת])([א-ת])$/, '$1״$2'],
  [/^([א-ת])$/, '$1׳']
])

function archaicNumbers(arr) {
  var arrParse = arr.slice().sort(function(a, b) {
    return b[1].length - a[1].length
  })
  return {
    format: function(n) {
      var ret = ''
      $.each(arr, function() {
        var num = this[0]
        if (parseInt(num) > 0) {
          for (; n >= num; n -= num) ret += this[1]
        } else {
          ret = ret.replace(num, this[1])
        }
      })
      return ret
    }
  }
}

function alphaNumeric(num, upperLower) {
  num = Number(num) - 1
  var aNum = ''
  if (upperLower == 'upperCase') {
    aNum = (((num / 26 >= 1) ? String.fromCharCode(num / 26 + 64) : '') + String.fromCharCode(num % 26 + 65)).toUpperCase()
  } else if (upperLower == 'lowerCase') {
    aNum = (((num / 26 >= 1) ? String.fromCharCode(num / 26 + 64) : '') + String.fromCharCode(num % 26 + 65)).toLowerCase()
  }
  return aNum
}
