<template>
  <el-container class="home-container">
    <el-header>
      <el-avatar shape="circle" :size="50" :src="avtar"></el-avatar>
      <p>华益瑞数据分析平台-测试版</p>
    </el-header>
    <el-container>
      <el-aside width="300px">
        <el-tree
          :data="data"
          show-checkbox
          node-key="id"
          ref="tree"
          highlight-current
          :props="defaultProps"
        >
        </el-tree>
      </el-aside>
      <el-main>
        <el-date-picker
          v-model="value1"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        >
        </el-date-picker>
        <el-radio-group v-model="radio">
          <el-radio :label="1">折线图</el-radio>
          <el-radio :label="2">散点图</el-radio>
          <el-radio :label="3">风玫瑰图</el-radio>
          <el-radio :label="4">列表</el-radio>
        </el-radio-group>
        <el-button type="primary" @click="postdata()">提交</el-button>
        <div class="main">
          <!-- <el-table
            :data="tableData"
            border
            width="100%"
            v-if="show_table"
            height="100%"
            stripe
            fit
          >
            <el-table-column
              :key="col.prop"
              :label="col.label"
              :prop="col.prop"
              :width="col.width"
              :fixed="col.fixed"
              v-for="col in cols"
            >
            </el-table-column>
          </el-table> -->
          <u-table
            :data="tableData"
            border
            width="100%"
            v-if="show_table"
            :height="height"
            use-virtual
            showBodyOverflow="title"
            showHeaderOverflow="title"
            :row-height="rowHeight"
            stripe
            fit
          >
            <u-table-column
              :key="col.prop"
              :label="col.label"
              :prop="col.prop"
              :width="col.width"
              :fixed="col.fixed"
              v-for="col in cols"
            >
            </u-table-column>
          </u-table>
          <div id="myChart" :style="{ width: '100%', height: '100%' }"></div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import ecStat from "echarts-stat";
export default {
  data() {
    return {
      height: 900,
      rowHeight: 55,
      avtar: require("../assets/truwel.jpg"),
      radio: 1,
      value1: "",
      data: "",
      defaultProps: {
        children: "children",
        label: "label",
      },
      tableData: [],
      cols: [],
      id: "",
      show_table: false,
    };
  },
  methods: {
    //请求数据
    async postdata() {
      try {
        if (!this.value1) {
          return this.$message.error("请选择时间");
        } else if (this.$refs.tree.getCheckedNodes(true) == "") {
          return this.$message.error("请选择参数");
        } else if (
          this.$refs.tree.getCheckedNodes(true).length > 4 &&
          this.radio == 1
        ) {
          return this.$message.error("最多选4个参数");
        } else if (
          this.$refs.tree.getCheckedNodes(true).length > 2 &&
          this.radio == 2
        ) {
          return this.$message.error("最多选2个参数");
        } else if (
          this.$refs.tree.getCheckedNodes(true).length < 2 &&
          (this.radio == 2 || this.radio == 3)
        ) {
          return this.$message.error("请选择至少2个参数");
        } else if (
          this.$refs.tree.getCheckedNodes(true).length % 2 !== 0 &&
          this.radio == 3
        ) {
          return this.$message.error("请选择成对风速风向参数");
        } else if (
          this.$refs.tree.getCheckedNodes(true).length > 8 &&
          this.radio == 3
        ) {
          return this.$message.error("最多选4对参数");
        } else if (
          this.$refs.tree.getCheckedNodes(true, false)[0].table !==
            this.$refs.tree.getCheckedNodes(true, false)[
              this.$refs.tree.getCheckedNodes(true, false).length - 1
            ].table &&
          this.radio == 4
        ) {
          return this.$message.error("最多选择1张表");
        }
        const rLoading = this.openLoading();
        const { data: res1 } = await this.$http.post("diagram.php", {
          type: this.radio,
          date: this.value1,
          station: this.$refs.tree.getCheckedNodes(true),
        });
        //隐藏表格视图
        this.show_table = false;
        rLoading.close();
        if (this.radio == 1) {
          this.diagram_line_mult(res1);
        } else if (this.radio == 2) {
          this.diagram_scatter_mult(res1);
        } else if (this.radio == 3) {
          this.diagram_windrose_mult(res1);
        } else if (this.radio == 4) {
          this.table_mult(res1);
        }
      } catch (error_message) {
        this.$message.error(error_message);
      }
    },
    //折线图
    diagram_line_mult(param_diaram) {
      var mult_series = new Array(),
        mult_legend = new Array(),
        mult_yAxis = new Array(),
        colors = ["#5470C6", "#91CC75", "#EE6666", "#E43961"];
      for (var i = 0; i < this.$refs.tree.getCheckedNodes(true).length; i++) {
        mult_legend.push(this.$refs.tree.getCheckedNodes(true)[i].label);
        if (i == 0) {
          mult_yAxis.push({
            name: this.$refs.tree.getCheckedNodes(true)[i].label,
            type: "value",
            position: "left",
            axisLine: { show: true, lineStyle: { color: "#5AABFF" } },
          });
        } else {
          mult_yAxis.push({
            offset: i * 80 - 80,
            name: this.$refs.tree.getCheckedNodes(true)[i].label,
            type: "value",
            position: "right",
            axisLine: { show: true, lineStyle: { color: colors[i] } },
          });
        }
        mult_series.push({ yAxisIndex: i, type: "line" });
      }
      this.$echarts.init(document.getElementById("myChart")).dispose();
      let myEchart = this.$echarts.init(document.getElementById("myChart"));
      let option = {
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        grid: {
          left: "10%",
          height: "50%",
          width: "70%",
        },
        dataset: [
          {
            source: param_diaram,
          },
        ],
        legend: {
          data: mult_legend,
        },
        xAxis: {
          type: "category",
          axisLabel: {
            rotate: 21,
          },
        },
        yAxis: mult_yAxis,
        series: mult_series,
      };
      myEchart.setOption(option);
    },
    //散点图
    diagram_scatter_mult(param_diaram) {
      this.$echarts.registerTransform(ecStat.transform.regression);
      this.$echarts.init(document.getElementById("myChart")).dispose();
      let myEchart = this.$echarts.init(document.getElementById("myChart"));
      let option = {
        grid: {
          left: "15%",
          height: "50%",
          width: "70%",
        },
        title: {
          text:
            this.$refs.tree.getCheckedNodes(true)[0].label +
            "—" +
            this.$refs.tree.getCheckedNodes(true)[1].label +
            "相关性分析",
          left: "center",
        },
        dataset: [
          {
            source: param_diaram,
          },
          {
            transform: {
              type: "ecStat:regression",
              // 'linear' by default.
              // config: { method: 'linear', formulaOn: 'end'}
            },
          },
        ],
        xAxis: {
          splitLine: {
            lineStyle: {
              type: "dashed",
            },
          },
        },
        yAxis: {
          splitLine: {
            lineStyle: {
              type: "dashed",
            },
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        series: [
          {
            name: "散点",
            type: "scatter",
          },
          {
            name: "拟合方程",
            type: "line",
            datasetIndex: 1,
            symbolSize: 0.1,
            symbol: "circle",
            label: { show: true, fontSize: 16 },
            labelLayout: { dx: -20 },
            encode: { label: 2, tooltip: 1 },
          },
        ],
      };
      myEchart.setOption(option);
    },
    //风玫瑰图
    diagram_windrose_mult(param_diaram) {
      let that = this;
      let param_diaram_num = param_diaram.length;
      //处理windrose数据
      let stack = ["a", "b", "c", "d"];
      let dataColor = [
        "rgb(124, 181, 236)",
        "rgb(67, 67, 72)",
        "rgb(144, 237, 125)",
        "rgb(247, 163, 92)",
        "rgb(128, 133, 233)",
        "rgb(228, 211, 84)",
        "rgb(241, 92, 128)",
      ];
      let dataLegend = [
        "0.2-1m/s",
        "1-2m/s",
        "2-4m/s",
        "4-6m/s",
        "6-8m/s",
        "8-10m/s",
        ">10m/s",
      ];
      let dataW = [],
        percentage = [];
      for (var m = 0; m < param_diaram_num; m++) {
        var obj = param_diaram[m];
        var arr = Object.values(obj);
        let dataC = [],
          dataB = [],
          dataD = [],
          dataE = [],
          dataF = [],
          dataG = [],
          dataH = [];
        percentage[m] = [];
        for (var i = 0; i < 16; i++) {
          dataC.push(arr[i]);
          dataB.push(arr[i + 16]);
          dataD.push(arr[i + 32]);
          dataE.push(arr[i + 48]);
          dataF.push(arr[i + 64]);
          dataG.push(arr[i + 80]);
          dataH.push(arr[i + 96]);
          percentage[m].push(arr[i + 112]);
        }
        dataW[m] = [];
        dataW[m].push(dataC, dataB, dataD, dataE, dataF, dataG, dataH);
      }
      //开始绘图
      //开始绘图
      this.$echarts.registerTransform(ecStat.transform.regression);
      this.$echarts.init(document.getElementById("myChart")).dispose();
      let myEchart = this.$echarts.init(document.getElementById("myChart"));
      var polar = [];
      for (var i = 0; i < param_diaram_num; i++) {
        polar.push({
          center: [20 + 44 * (i % 2) + "%", 25 + 44 * Math.floor(i / 2) + "%"],
          radius: "35%",
        });
      }
      let option = {
        // title: {
        //   text: this.$refs.tree.getCheckedNodes(true)[0].table + "风玫瑰图",
        //   left: "center",
        // },
        // grid: (function () {
        //   var grid_data = [];
        //   for (var m = 1; m < param_diaram_num + 1; m++) {
        //     var topp = m % 2 == 0 ? "7%" : "50%";
        //     grid_data.push({
        //       left: "7%",
        //       top: topp,
        //       height: "38%",
        //       width: "38%",
        //     });
        //   }
        //   return grid_data;
        // })(),
        title: (function () {
          var title_data = [];
          for (var m = 1; m < param_diaram_num + 1; m++) {
            var leftt = m % 2 == 0 ? "64%" : "20%";
            var topp = m <= 2 ? "1%" : "45%";
            title_data.push({
              text:
                that.$refs.tree.getCheckedNodes(true)[m * 2 - 2].table +
                "风玫瑰图",
              textAlign: "center",
              left: leftt,
              top: topp,
            });
          }
          return title_data;
        })(),
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            var p = 0;
            var arr = [
              "N",
              "NNE",
              "NE",
              "ENE",
              "E",
              "ESE",
              "SE",
              "SSE",
              "S",
              "SSW",
              "SW",
              "WSW",
              "W",
              "WNW",
              "NW",
              "NNW",
            ];
            for (var m = 0; m < param_diaram_num; m++) {
              for (var i = 0; i < arr.length; i++) {
                if (arr[i] == params[0].name) {
                  // console.log(params);
                  p = percentage[m][i];
                  break;
                }
              }
              var cp = p * 100;
              var ppp = cp.toFixed(1);
              var htmlStr = "";
              for (var i = 0; i < params.length; i++) {
                var param = params[i];
                var xName = param.name; //x轴的名称
                var seriesName = param.seriesName; //图例名称
                var value = param.value; //y轴值
                var color = param.color; //图例颜色

                if (i === 0) {
                  htmlStr += xName + "  " + ppp + "%" + "<br/>"; //x轴的名称
                }
                var c = (value / p).toFixed(2);

                if (c == 0.0 || c == "NaN") {
                  c = "";
                }
                htmlStr += "<div>";
                htmlStr +=
                  '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                  color +
                  ';"></span>';
                htmlStr += seriesName + "：" + c;
                htmlStr += "</div>";
              }
            }
            return htmlStr;
          },
        },
        polar: {
          radius: "70%",
        },
        polar: polar,
        legend: {
          type: "scroll",
          itemWidth: 13,
          right: "5%",
          top: "center",
          orient: "vertical",
        },
        angleAxis: (function () {
          var angle_data = [];
          for (var m = 0; m < param_diaram_num; m++) {
            angle_data.push({
              polarIndex: m,
              axisTick: {
                show: false,
              },
              type: "category",
              data: [
                "N",
                "NNE",
                "NE",
                "ENE",
                "E",
                "ESE",
                "SE",
                "SSE",
                "S",
                "SSW",
                "SW",
                "WSW",
                "W",
                "WNW",
                "NW",
                "NNW",
              ],
              detail: {
                "font-size": 10,
                color: "#7eecb6",
              },

              z: 0,
              boundaryGap: false,
              splitLine: {
                show: true,
                lineStyle: {
                  color: "#007BE1",
                  type: "dashed",
                },
              },
              axisLine: {
                show: false,
              },
              axisLabel: {
                fontSize: 10,
                color: "black",
              },
            });
          }
          return angle_data;
        })(),
        radiusAxis: (function () {
          var radius_data = [];
          for (var m = 0; m < param_diaram_num; m++) {
            radius_data.push({
              polarIndex: m,
              axisLine: {
                show: false,
              },
              axisTick: {
                show: false,
              },
              splitLine: {
                lineStyle: {
                  // 使用深浅的间隔色
                  color: "#007BE1",
                },
              },
              z: 100,
              axisLabel: {
                show: false,
                textStyle: {
                  color: "white",
                },
              },
            });
          }
          return radius_data;
        })(),
        series: (function () {
          let wnd_data = [];
          for (var m = 0; m < param_diaram_num; m++) {
            for (var k in dataLegend) {
              wnd_data.push({
                polarIndex: m,
                type: "bar",
                data: dataW[m][k],
                coordinateSystem: "polar",
                name: "(" + m + "):" + dataLegend[k],
                stack: stack[m],
                itemStyle: {
                  normal: {
                    color: dataColor[k],
                  },
                },
              });
            }
            var cpc = param_diaram[m].num129 * 100;
            var cpcc = cpc.toFixed(1);
            wnd_data.push({
              polarIndex: m,
              type: "bar",
              data: [],
              coordinateSystem: "polar",
              name: "(" + m + "):" + "静风频率：" + cpcc + "%",
              stack: stack[m],
              itemStyle: {
                normal: {
                  color: "#21A1F1",
                },
              },
              label: {
                fontSize: "20px",
              },
            });
          }
          return wnd_data;
        })(),
      };
      myEchart.setOption(option);
    },
    table_mult(param_diaram) {
      this.$echarts.init(document.getElementById("myChart")).dispose();
      //显示表格视图
      this.show_table = true;
      this.cols = [];
      this.cols.push(
        { prop: "TmStamp", label: "TmStamp", width: 145, fixed: true },
        { prop: "RecNum", label: "RecNum", width: 80 }
      );
      for (var j = 0; j < this.$refs.tree.getCheckedNodes(true).length; j++) {
        var obj = {};
        obj.label = this.$refs.tree.getCheckedNodes(true)[j].label;
        obj.prop = this.$refs.tree.getCheckedNodes(true)[j].label;
        obj.width = 95;
        this.cols.push(obj);
      }
      this.tableData = [];
      for (var i = 0; i < param_diaram.each_row.length; i++) {
        this.tableData.push(param_diaram.each_row[i]);
      }
    },
    //设置默认日期
    defaultDate() {
      //获取新的时间
      let date = new Date();
      //获取当前时间的年份转为字符串
      let year = date.getFullYear().toString();
      //获取月份，由于月份从0开始，此处要加1，判断是否小于10，如果是在字符串前面拼接'0'
      let month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1).toString()
          : (date.getMonth() + 1).toString();
      //获取天，判断是否小于10，如果是在字符串前面拼接'0'
      let da =
        date.getDate() < 10
          ? "0" + date.getDate().toString()
          : date.getDate().toString();
      let da2 = date.getDate().toString() - 1;
      //字符串拼接，开始时间，结束时间
      let end = year + "-" + month + "-" + da;
      let begin = year + "-" + month + "-" + da2;
      this.value1 = [begin, end]; //将值设置给插件绑定的数据
    },

    async gettree() {
      const { data: res2 } = await this.$http.get("tree.php");
      this.data = res2;
    },
  },
  beforeMount: function () {
    this.gettree();
    this.defaultDate();
  },
};
</script>

<style  scoped>
.home-container {
  height: 100%;
}
.el-header {
  background: #373d41;
  display: flex;
  align-items: center;
}
.el-header p {
  color: #eaedf1;
  margin-left: 20px;
  font-size: 20px;
  font-family: "PingFang SC";
}
.el-aside {
  background: #333744;
  height: 1020px;
}
.el-main {
  background: #eaedf1;
}
.el-button,
.el-radio-group {
  margin-left: 15px;
}
.main {
  border: 1px #dcdfe6 solid;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  margin-top: 10px;
  width: 100%;
  height: 920px;
}
</style>