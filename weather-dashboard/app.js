// app.js
const state = { data: null };

const loadData = async () => {
  $('#status').text('加载中…').show();
  try {
    const response = await fetch('data/weather.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.days.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：' + data.source);
    $('#status').hide();
    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

const renderCards = (data) => {
  const avg = arr => (arr.reduce((s, n) => s + n, 0) / arr.length).toFixed(1);
  const cards = [
    { label: '平均最高温', value: avg(data.highs) + ' ℃' },
    { label: '平均最低温', value: avg(data.lows) + ' ℃' },
    { label: '最大日降水', value: Math.max(...data.precipitation) + ' mm' },
    { label: '平均空气质量指数', value: avg(data.aqi) }
  ];
  cards.forEach(c => {
    $('#cards').append(`
      <div class="col-md-3 col-6">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="card-title h6">${c.label}</h3>
            <p class="card-text fs-4">${c.value}</p>
          </div>
        </div>
      </div>
    `);
  });
};

let barChart = null;

const renderBarChart = (data) => {
  if (barChart === null) {
    barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  barChart.setOption({
    title: { text: '每日降水量（单位：mm）', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { data: data.days },
    yAxis: { name: 'mm' },
    series: [{ name: '降水量', type: 'bar', data: data.precipitation }]
  });
};

let lineChart = null;

const renderLineChart = (data) => {
  if (lineChart !== null) {
    lineChart.destroy();          // 防重复初始化
  }
  const ctx = document.querySelector('#line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.days,
      datasets: [
        { label: '最高温', data: data.highs, borderWidth: 2, tension: 0.3 },
        { label: '最低温', data: data.lows, borderWidth: 2, tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '气温趋势（单位：℃）' }
      }
    }
  });
};

window.addEventListener('resize', () => {
  if (barChart) barChart.resize();
  // Chart.js响应式默认自动处理，无需手动
});

loadData();
