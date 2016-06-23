 "use strict";              

        //основная функция и загрузка данных
        d3.json("http://woldemarg.github.io/d3charts/wordcloud/words_experts.php", function(error, data) {
            if (error) {throw error};

            //создание облака - http://bl.ocks.org/jwhitfieldseed/9697914
            function draw(words) {

                //шкала цветов
                var fill = d3.scale.category10();

                var svg = d3.select("#expertcloud")
                    .append("svg")
                    .attr("width", 500)
                    .attr("height", 150)
                    .attr("class", "wordcloud")
                    .append("g")
                    //обязательная трансформация - середина длині и ширині облака
                    .attr("transform", "translate(250,75)");

                var cloud = svg.selectAll("g text")
                    .data(words);

                //инициализация облака
                cloud.enter()
                    .append("text")
                    .style("fill", function(d, i) {
                        return fill(i);
                    })
                    .attr("text-anchor", "middle")
                    .attr('font-size', 1)
                    .text(function(d) {
                        return d.key;
                    });

                //развертывание облака
                cloud.transition()
                    .duration(2000)
                    .style("font-size", function(d) {
                        return d.value + "px";
                    })
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .style("fill-opacity", 1);

            }

            //частота употребления слов http://stackoverflow.com/questions/30906807/word-frequency-in-javascript
            function wordFreq(data) {
                var comments = data.map(function(c) {
                    return c.msg;
                });
                var text = comments.join();
                var words = text.toLowerCase() //снимаем регистр
                    .replace(/[-!\.,:;\?0123456789«»#№$%"'=_]/g, ' ') //замена спецсимволов на пробелы
                    .replace(/[abcdefghijklmnopqrstuvwxyz]/g, ' ') //замена латинских букв на пробелы
                    .replace(/\(|\)/g, ' ') //замена скобок на пробелы
                    .replace(/\s\s+/g, ' ') //замена 2х и боле пробелов на один
                    .split(/\s/); //раздел текста по пробелам

                //только слова длиннее 4 букв
                var longWords = words.filter(function(element) {
                    return element.length >= 4;
                });

                var freqMap = {};
                longWords.forEach(function(w) { //подсчет частоты для каждого слова а тексте
                    if (!freqMap[w]) {
                        freqMap[w] = 0;
                    }
                    freqMap[w] += 1;
                });

                return freqMap;
            }

            var frequency_list_full = d3.entries(wordFreq(data));

            //сортировка по частоте упоминания слов   
            frequency_list_full.sort(function(a, b) {
                return d3.descending(a.value, b.value);
            });
            
            //топ-50 слов - окончателный список для формирования облака   
            var frequency_list = frequency_list_full.slice(0, 50);

            d3.layout.cloud()
                .size([500, 150]) //по размеру контейнера
                .words(frequency_list) //исходные данные
                .padding(1) //плотность слов в облаке
                //задание угла наклона слов в облаке
                .rotate(function() {
                    return ~~(Math.random() * 2) * 90;
                })
                .fontSize(function(d) {
                    return d.value;//поправочный коэффициент 
                })
                .on("end", draw) //вызов функции создания облака
                .start(); //??

        });
