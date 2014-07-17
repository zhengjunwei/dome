/*
  Email:cxrhphp@qq.com
  Name:Eric Zheng


  Hi,everyone,I am a chinese man,and i found this dom library is very nice,and i want to see what it works,then i think i can
  translate this dom library to all of the chinese coders.
  if you have any question ,please see as this link:
  [http://code.tutsplus.com/tutorials/build-your-first-javascript-library--net-26796]

  Notice:this library can only used for study ,if you want to use it in the product environment,please make sure your customers 
  are only use these browers:Internet Explorer 8+, Firefox 5+, Opera 10+, Chrome, and Safari.

*/


//IE8无此方法，所以扩展一个如果不存在的话
if (typeof Array.prototype.indexOf !== 'function') {
    Array.prototype.indexOf = function (item) {
        for(var i = 0; i < this.length; i++) {
            if (this[i] === item) {
                return i;
            }
        }
        return -1;
    }; 
}

/*****************************************************************************************************************/
/*
  window.dome = (function(){}(
      return dome;
  ));

  这里是一个IIFE，立即执行函数，把dome这个实例给传回去了
  构造函数----->Dome
  工具方法------>map,mapOne,forEach
  DOM操作方法--->text,html,addClass,removeClass,prepend,append,attr,remove
  事件方法------>on,off

  如何使用:
  var DOMList = dome.get();或
  var DOMList1 = dome.create();
  我们得到的DOMList就会拥有一系列的DOM操作API和工具API

*/


window.dome = (function () {

/*****************************************************************************************************************/

    /*
      先看第170行，Dome是一个构造函数
      这个方法的作用是把this指向当前new出来的对象，把els所有的元素都拷给当前对象，并且把length也赋予给当前对象
    */
    function Dome(els) {
        for(var i = 0; i < els.length; i++ ) {
            this[i] = els[i];
        }
        this.length = els.length;
    }


/*****************************************************************************************************************/

    // ========= UTILS =========
    //下面是一些工具方法
    /*
      使用方法如下:
    */
    Dome.prototype.forEach = function (callback) {
        this.map(callback);
        return this; 
    };
    Dome.prototype.map = function (callback) {
        var results = [];
        for (var i = 0; i < this.length; i++) {
            results.push(callback.call(this, this[i], i));
        }
        return results; //.length > 1 ? results : results[0];
    };
    Dome.prototype.mapOne = function (callback) {
        var m = this.map(callback);
        return m.length > 1 ? m : m[0];
    };


/*****************************************************************************************************************/

    // ========== DOM MANIPULATION ==========
    //操作Dome
    /*
      使用方法如下:
    */
    Dome.prototype.text = function (text) {
        if (typeof text !== "undefined") {
            return this.forEach(function (el) {
                el.innerText = text;
            });
        } else {
            return this.mapOne(function (el) {
                return el.innerText;
            });
        }
    };

    Dome.prototype.html = function (html) {
        if (typeof html !== "undefined") {
            return this.forEach(function (el) {
                el.innerHTML = html;
            });
        } else {
            return this.mapOne(function (el) {
                return el.innerHTML;
            });
        }
    };

    Dome.prototype.addClass = function (classes) {
        var className = "";
        if (typeof classes !== 'string') {
            for (var i = 0; i < classes.length; i++) {
               className += " " + classes[i];
            }
        } else {
            className = " " + classes;
        }
        return this.forEach(function (el) {
            el.className += className;
        });
    };

    Dome.prototype.removeClass = function (clazz) {
        return this.forEach(function (el) {
            var cs = el.className.split(' '), i;

            while ( (i = cs.indexOf(clazz)) > -1) { 
                cs = cs.slice(0, i).concat(cs.slice(++i));
            }
            el.className = cs.join(' ');
        });
    };

    Dome.prototype.attr = function (attr, val) {
        if (typeof val !== 'undefined') {
            return this.forEach(function(el) {
                el.setAttribute(attr, val);
            });
        } else {
            return this.mapOne(function (el) {
                return el.getAttribute(attr);
            });
        }
    };

    Dome.prototype.append = function (els) {
        return this.forEach(function (parEl, i) {
            els.forEach(function (childEl) {
                parEl.appendChild( (i > 0) ? childEl.cloneNode(true) : childEl);
            });
        });
    };

    Dome.prototype.prepend = function (els) {
        return this.forEach(function (parEl, i) {
            for (var j = els.length -1; j > -1; j--) {
                parEl.insertBefore((i > 0) ? els[j].cloneNode(true) : els[j], parEl.firstChild);
            }
        });
    };

    Dome.prototype.remove = function () {
        return this.forEach(function (el) {
            return el.parentNode.removeChild(el);
        });
    };


/*****************************************************************************************************************/
    //下面的on方法和off方法是用来处理事件的
    Dome.prototype.on = (function () {
        if (document.addEventListener) {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el.addEventListener(evt, fn, false);
                });
            };
        } else if (document.attachEvent)  {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el.attachEvent("on" + evt, fn);
                });
            };
        } else {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el["on" + evt] = fn;
                });
            };
        }
    }());

    Dome.prototype.off = (function () {
        if (document.removeEventListener) {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el.removeEventListener(evt, fn, false);
                });
            };
        } else if (document.detachEvent)  {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el.detachEvent("on" + evt, fn);
                });
            };
        } else {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el["on" + evt] = null;
                });
            };
        }
    }());



/*****************************************************************************************************************/

    var dome = {
        /*
          get方法
            情况一:如果传进来的是字符串，则使用querySelectorAll('string')查找到NodeList
            情况二:如果是一个有长度的对象，则直接使用
            情况三:剩下的就是单个元素，则用一个[]包装成一个数组返回

            然后再调用构造函数Dome，把上面的NodeList或者数组传进去
        */ 
        get: function (selector) {
            var els;
            if (typeof selector === 'string') {
                els = document.querySelectorAll(selector);
            } else if (selector.length) { 
                els = selector;
            } else {
                els = [selector];
            }
            return new Dome(els);
        }, 
        /*
            create方法

        */
        create: function (tagName, attrs) {
            var el = new Dome([document.createElement(tagName)]);
            if (attrs) {
                if (attrs.className) { 
                    el.addClass(attrs.className);
                    delete attrs.className;
                }
                if (attrs.text) { 
                    el.text(attrs.text);
                    delete attrs.text;
                }
                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        el.attr(key, attrs[key]);
                    }
                }
            }
            return el;
        }
    };



    return dome;
}());




/*
  
*/