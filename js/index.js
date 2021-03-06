const { dialog, shell } = require('electron').remote

// 方法名对照
const categoryFUNCS = {
    'HTML': handleHTML,
    'CSS': handleCSS,
    'JS': handleJS,
    'IMAGE': handleIMG,
    '通用': handleALL
}

/**
 * Vue 实例
 */

var customInput = {
    model: {
        prop: 'userValue',
        event: 'change'
    },
    props: ['label', 'userValue', 'placeholder'],
    template: `<div class="form-group">
    <label>{{label}}</label>
    <input type="text" class="form-control" :placeholder="placeholder" :value="userValue"  @input="updateValue($event.target.value)">
  </div>`,
    methods: {
        updateValue(newVal) {
            this.$emit('change', newVal)
        }
    }
}
var customRadio = {
    model: {
        prop: 'userValue',
        event: 'change'
    },
    computed: {
        randomName() {
            return 'radio' + 100 * (Math.random() * Math.random()).toFixed(2);
        }
    },
    props: ['label', 'userValue'],
    template: `
  <div class="form-group">
    <div class="radio" v-for="item in label">
      <label>
        <input type="radio" name="randomName" @change="updateValue($event.target.value)" :value="item" :checked="userValue == item">
        {{ item }}
      </label>
    </div>
  </div>
  `,
    methods: {
        updateValue(newVal) {
            console.log(newVal);
            this.$emit('change', newVal);
        }
    }
}
var customCheckbox = {
    model: {
        prop: 'userValue',
        event: 'change'
    },
    props: ['label', 'userValue'],
    template: `
  <div class="checkbox">
  <label>
  <input type="checkbox" :checked="userValue" @change="updateValue($event.target.checked)"> {{ label }}
  </label>
  </div>
  `,
    methods: {
        updateValue(newVal) {
            console.log(newVal);
            this.$emit('change', newVal);
        }
    }
}

let storedActions = getStore('actions');
let defaultActions = [{
        name: 'HTML',
        list: [
            { name: '压缩', funcName: 'htmlmin', icon: 'html', disabled: false }, {
                name: '合并 css / js',
                funcName: 'usemin',
                icon: 'html',
                disabled: false,
                isSolo: true,
                wiki: 'https://www.zybuluo.com/alexlee/note/841903',
                configs: [{
                        type: 'custom-checkbox',
                        label: '是否压缩合并后的 js',
                        key: 'isUglify',
                        value: false
                    }, {
                        type: 'custom-checkbox',
                        label: '是否添加版本号',
                        key: 'isRev',
                        value: false
                    },
                    {
                        type: 'custom-checkbox',
                        label: '是否保存设置',
                        key: 'isSaved',
                        value: false
                    }
                ]
            }
        ]
    },
    { name: 'CSS', list: [{ name: '添加兼容性前缀', funcName: 'prefix', icon: 'css', disabled: false }, { name: '压缩', funcName: 'compress', icon: 'css', disabled: false }] },
    { name: 'JS', list: [{ name: '压缩', funcName: 'uglify', icon: 'js', disabled: false }] },
    {
        name: 'IMAGE',
        list: [
            { name: '压缩', funcName: 'imagemin', icon: 'img', disabled: false },
            {
                name: '精灵图',
                funcName: 'sprite',
                icon: 'img',
                disabled: false,
                isSolo: true,
                configs: [{
                        type: 'custom-input',
                        label: '精灵图文件名',
                        key: 'imgName',
                        value: 'sprite.png'
                    },
                    {
                        type: 'custom-input',
                        label: 'css文件名',
                        key: 'cssName',
                        value: 'sprite.css'
                    },
                    {
                        type: 'custom-input',
                        label: 'css中引用的图片地址',
                        key: 'imgPath',
                        value: 'sprite.png'
                    },
                    {
                        type: 'custom-input',
                        label: '精灵图导出地址',
                        key: 'imgDest',
                        value: './'
                    },
                    {
                        type: 'custom-input',
                        label: 'css导出地址',
                        key: 'cssDest',
                        value: './'
                    },
                    {
                        type: 'custom-checkbox',
                        label: '是否压缩精灵图',
                        key: 'isImgMin',
                        value: true
                    },
                    {
                        type: 'custom-checkbox',
                        label: '是否压缩css',
                        key: 'isCssMin',
                        value: false
                    },
                    {
                        type: 'custom-checkbox',
                        label: '是否保存设置',
                        key: 'isSaved',
                        value: false
                    }
                ]
            }
        ]
    },
    {
        name: '通用',
        list: [{
            name: '重命名',
            funcName: 'rename',
            icon: 'reset',
            disabled: false,
            configs: [{
                    type: 'custom-input',
                    label: '文件名',
                    key: 'basename',
                    value: '', // 默认原文件名
                    placeholder: '默认原文件名'
                }, {
                    type: 'custom-input',
                    label: '前缀',
                    key: 'prefix',
                    value: '',
                    placeholder: '例: bonjour-'
                }, {
                    type: 'custom-input',
                    label: '后缀',
                    key: 'suffix',
                    value: '',
                    placeholder: '例: -hola'
                }, {
                    type: 'custom-input',
                    label: '扩展名',
                    key: 'extname',
                    value: '', // 默认原文件扩展名
                    placeholder: '默认原文件扩展名'
                },
                {
                    type: 'custom-checkbox',
                    label: '是否保存设置',
                    key: 'isSaved',
                    value: false
                }
            ]
        }, {
            name: '自定义设置',
            funcName: 'dest',
            icon: 'reset',
            disabled: false,
            configs: [{
                    type: 'custom-input',
                    label: '导出目录',
                    key: 'dest',
                    value: '', // 默认文件当前目录
                    placeholder: '默认文件当前目录'
                },
                // {
                //   type: 'custom-checkbox',
                //   label: '处理完打开文件所在位置',
                //   key: 'openDir',
                //   value: false
                // },
                {
                    type: 'custom-checkbox',
                    label: '是否保存设置',
                    key: 'isSaved',
                    value: false
                }
            ]
        }]
    }
];
var app = new Vue({
    el: '#app',
    data: {
        actions: deepClone(storedActions ? storedActions : defaultActions),
        currentCategory: '',
        currentActions: [],
        isLoading: false,
        loadingMsg: '处理中...',
        isDone: false,
        currentStatus: '',
        isSolo: false // 当前只有一个操作，不能拼接其他操作
    },
    computed: {
        currentActionsName() {
            let arr = [];
            this.currentActions.forEach(function(element) {
                arr.push(element.action.funcName);
            })
            return arr;
        }
    },
    components: {
        customInput,
        customRadio,
        customCheckbox

    },
    watch: {
        isLoading(newVal) {
          if (!newVal) {
              let vm = this;
              vm.isDone = true;
              setTimeout(() => {
                  vm.isDone = false;
              }, 2000)
          }
        }
    },
    methods: {
        addToCurrent(category, action, index) {
            // 当前 可执行操作 为 不可拼接操作，因此不能添加新操作
            if (this.isSolo) { return; }
            // 操作列表不为空时不能添加 不可拼接操作
            if ((this.currentActions.length > 0) && action.isSolo) { return; }

            // 判断当前操作类型是否可选
            let isCategoryDisabled = !!this.currentCategory && (category.name !== this.currentCategory) && (category.name !== '通用') && (this.currentCategory !== '通用');
            // 判断当前操作是否已经添加
            let isActionSelected = action.disabled;
            if (isCategoryDisabled || isActionSelected) {
                return;
            }

            // 更新当前操作类型
            this.currentCategory = ((category.name == '通用') && (!!this.currentCategory)) ? this.currentCategory : category.name;

            // 添加操作
            let selected = {
                action: deepClone(action),
                index: index
            }
            console.log('action', action);
            console.log('selected', selected);

            this.currentActions.push(selected);
            // 禁用已选操作
            this.actions[index[0]].list[index[1]].disabled = true;

            if (action.isSolo) {
                // 禁用其他操作
                this.isSolo = true;
            }

            console.log(`this.currentCategory: ${this.currentCategory}`);
        },
        deleteAction(actionWrap, index) {
            // 删除操作
            this.currentActions.splice(index, 1);

            if (actionWrap.action.isSolo) {
                this.isSolo = false;
            }

            let idx = actionWrap.index;
            // 取消禁用删除的操作
            this.actions[idx[0]].list[idx[1]].disabled = false;

            let isLeftCommon = false;
            for (let item of this.currentActions) {
                let category = this.actions[item.index[0]].name;
                if (category !== '通用') {
                    this.currentCategory = category;
                    break;
                } else {
                    isLeftCommon = true;
                }
            }

            // 判断当前操作列表是否为空
            if (!(this.currentActions.length > 0)) {
                this.currentCategory = '';
            }
            if (isLeftCommon) {
                this.currentCategory = '通用';
            }
            console.log(`this.currentCategory: ${this.currentCategory}`);
        },
        getConfig() {
            console.table(this.currentActions[0].action.configs)
        },
        openExternal(link) {
            shell.openExternal(link);
        }
    }
})



let drake;

// 处理拖拽排序功能，更新数据
// 经历了两次数据更新，页面渲染
function dropHandler(el, target, source, sibling) {
    console.log(el, target, source, sibling);
    // 删除拖拽的数据 index
    let idx = el.dataset.idx;
    let action = app.currentActions.splice(idx, 1)[0];

    // 获取新的位置
    let newidx = sibling ? (sibling.dataset.idx - 1) : (target.querySelectorAll('.draggable-item').length);

    // 插入到新的位置
    app.$nextTick(function() {
        app.currentActions.splice(newidx, 0, action);
    })
    console.info(app.currentActions);
}

$(document).ready(function() {
    // 初始化拖拽排序
    drake = dragula([document.querySelector('#draggable')], {
        moves: function(el, source, handle, sibling) {
            console.log(handle);
            if (handle.classList && handle.classList.contains('draggable-item')) {
                return true;
            } else {
                return false;
            }
        }
    });
    // 处理拖拽排序功能
    drake.on('drop', dropHandler);

    //阻止浏览器默认行为
    $(document).on({
        dragleave: function(e) { //拖离
            e.preventDefault();
        },
        drop: function(e) { //拖后放
            e.preventDefault();
        },
        dragenter: function(e) { //拖进
            e.preventDefault();
        },
        dragover: function(e) { //拖来拖去
            e.preventDefault();
        }
    });

    // 拖进后改变 droparea 样式
    $('.j-dragarea').on('dragenter', function(e) {
        e.preventDefault();
        $(this).addClass('dragarea-on');
    });

    // 拖离后改变 droparea 样式
    $('.j-dragarea').on('dragleave', function(e) {
        e.preventDefault();
        $(this).removeClass('dragarea-on');
    });

    // drop只支持原生绑定
    $('.j-dragarea')[0].addEventListener('drop', function(e) {
        e.preventDefault();
        let fileList = e.dataTransfer.files; //获取文件
        fileList = Array.prototype.slice.call(fileList);
        let filePaths = [];
        fileList.forEach((file) => {
            filePaths.push(file.path);
        })
        handleFiles(filePaths);
    });

    // 选择文件
    $('.get-files')[0].addEventListener('click', function(e) {
        dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }, (filePaths) => {
            console.log(filePaths);
            handleFiles(filePaths);
        })
    })
    // 选择文件夹 
    $('.get-directories')[0].addEventListener('click', function(e) {
        dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] }, (filePaths) => {
            console.log(filePaths);
            handleFiles(filePaths);
        })
    })
});

/**
 * 处理获取到的文件路径
 * @author Alexee
 * @date   2017-08-07
 * @param  {Array}   filePaths [文件路径]
 * @return {[type]}             [description]
 */
var handleFiles = (filePaths) => {
    if (!filePaths) { return; } // 取消选择文件的情况

    // 当前未选择任何操作
    if (app.currentCategory == '') {
        alert(`当前未选择任何操作`);
        return;
    }

    var len = filePaths.length;
    if (len == 0) {
        console.log(filePaths.length);
        return false;
    }



    // 存储需要保存设置信息的操作
    let savedConfigs = [];
    // 存储一次文件处理的所有配置信息
    let configs = {};
    app.currentActions.forEach(function(element, index) {
        if (!element.action.configs) { return; }
        let cleanConfigs = {};
        element.action.configs.forEach((item, idx) => {
            cleanConfigs[item.key] = item.value;

            // 只要成功获取到文件列表，即代表保存设置生效
            // 判断当前操作 是否存在保存设置属性 及 保存设置是否为 true
            if ((item.key == 'isSaved') && item.value) {
                console.log('isSaved', element);
                savedConfigs.push(element);
            }
        })
        Object.assign(configs, cleanConfigs);
    })

    // 更新操作数据 及 localStorage 数据
    let actions = storedActions ? storedActions : defaultActions;
    actions = deepClone(actions);
    savedConfigs.forEach((element) => {
        let idx = element.index;
        // let configs = actions[idx[0]]['list'][idx[1]]['configs'];
        // 更新当前操作数据
        app.actions[idx[0]]['list'][idx[1]]['configs'] = element.action.configs;
        // 更新存于 localStorage 的操作数据，不同之处在于操作项的 disabled 属性值
        actions[idx[0]]['list'][idx[1]]['configs'] = element.action.configs;
    })
    // 更新 localStorage 数据
    setStore('actions', actions)


    // 判断是否批量操作文件
    let isTotal = app.currentActionsName.indexOf('sprite') !== -1;
    let multiSrc = [];
    let multiFileDir = Path.dirname(filePaths[0]);


    // 获取当前操作方法
    var handleFUNC = categoryFUNCS[app.currentCategory];


    //遍历拖进来的文件
    for (var i = 0; i < len; i++) {
        var filepath = filePaths[i];

        // 获取需要批量操作的文件位置
        if (isTotal) {
            // 判断是文件还是文件夹
            // src/**/*.{jpeg,jpg,png,gif,svg}
            let stats = fs.statSync(filepath);
            if (stats && stats.isDirectory()) {
                multiSrc.push(Path.join(filepath, '/**/*.{jpeg,jpg,png,gif,svg}'));
                console.log(stats, filepath, Path.join(filepath, '/**/*.{jpeg,jpg,png,gif,svg}'), multiSrc)
            } else {
                multiSrc.push(filepath);
            }
            continue;
            // 跳过以下内容继续执行 for 语句
        }

        // 分别处理单个文件
        walk(filepath, function(err, results) {
            // 克隆配置信息，针对单个文件进行配置信息的再处理
            let singleConfig = deepClone(configs);

            var fileTypeArr = results.split('.'),
                // 文件类型 fileType:css
                fileType = fileTypeArr[fileTypeArr.length - 1],
                fileNameArr = results.split("\\"),
                // 文件名 fileName: test.css
                fileName = fileNameArr[fileNameArr.length - 1];

            // 判断文件格式
            if (handleFileType(fileType)) {
                let fileDir = Path.dirname(results);

                // 如果未设置 basename 和 extname，默认使用原文件的信息
                if (app.currentActionsName.indexOf('rename') !== -1) {
                    let basename = fileName.split('.')[0];
                    let re = new RegExp(basename, 'gi');
                    let extname = fileName.replace(re, '');
                    singleConfig.basename = !!singleConfig.basename ? singleConfig.basename : basename;
                    singleConfig.extname = !!singleConfig.extname ? singleConfig.extname : extname;
                }

                // 判断是否设置了 导出目录，默认导出到当前目录，保存在 configs 变量里是为了让 spriteIMG 操作可以获取到
                singleConfig.dest = !!singleConfig.dest ? Path.resolve(fileDir, singleConfig.dest) : fileDir;
                //有文件，直接覆盖；没有文件，新建文件
                app.isLoading = true;
                handleFUNC(app.currentActionsName, results, singleConfig.dest, singleConfig, function(currentStatus) {
                    if (currentStatus == 'finished') {
                        app.isLoading = false;
                        app.currentStatus = '';
                        // 只能打开到路径指向：文件夹，不能进入文件夹，除非指定文件夹内的具体文件名
                        // if (singleConfig.openDir) {
                        //   shell.showItemInFolder(results);
                        // }
                    } else {
                        app.currentStatus = `执行操作：${currentStatus}`;
                    }
                });
            }
        });
    }

    // 批量处理文件（sprite 操作）
    if (isTotal) {
        // 判断是否设置了 导出目录，默认导出到当前目录，保存在 configs 变量里是为了让 spriteIMG 操作可以获取到
        configs.dest = !!configs.dest ? Path.resolve(multiFileDir, configs.dest) : multiFileDir;
        //有文件，直接覆盖；没有文件，新建文件
        app.isLoading = true;
        handleFUNC(app.currentActionsName, multiSrc, configs.dest, configs, function(currentStatus) {
            if (currentStatus == 'finished') {
                app.isLoading = false;
                app.currentStatus = '';
                // if (configs.openDir) {
                //   shell.showItemInFolder(multiSrc[0]);
                // }
            } else {
                app.currentStatus = `执行操作：${currentStatus}`;
            }
        });
    }
}



/**
 * 判断文件类型
 * @author Alexee
 * @date   2017-07-21
 * @param  {string}   fileType [文件后缀]
 * @return {boolean}           [是否符合格式]
 */
var handleFileType = (fileType) => {
    let typeOptions = {
        'CSS': ['css'],
        'JS': ['js'],
        'HTML': ['html'],
        'IMAGE': ['png', 'jpg', 'jpeg', 'gif', 'svg']
    }

    // 获取当前文件处理类型
    let currentCategory = app.currentCategory;

    if (currentCategory !== '通用') {
        // 获取当前可处理的文件的类型
        let currentTypes = typeOptions[currentCategory];

        console.log(`type: ${currentTypes.join('/')}`);

        // 只要处理的文件有格式不对的，都会提示
        if (currentTypes.indexOf(fileType.toLowerCase()) == -1) {
            alert(`请拖进 ${currentTypes.join('/')} 文件～`);
        } else {
            return true;
        }
    } else {
        return true;
    }
}



// 获取目录路径的文件直到没有子文件夹
var walk = function(dir, done) {
    fs.stat(dir, function(err, stats) {
        if (stats && stats.isDirectory()) {
            fs.readdir(dir, function(err, list) {
                list.forEach(function(file) {
                    file = Path.resolve(dir, file);
                    walk(file, done);
                });
            });
        } else {
            done(err, dir);
        }
    });
};

// new Date().Format("yyyy-MM-dd");
Date.prototype.Format = function(fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}