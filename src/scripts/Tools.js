var Tools = {
    "pen": false,
    "eraser": false,
    "fillBucket": false,
    "line": false,
    "ellipse": false,
    "rectangle": false,
    "filledEllipse": false,
    "filledRectangle": false,
    "sprayPaint": false,
    "eyedropper": false,
}

var ToolParams = {
    "pen": {
        "name": "pen",
        "id": "tool-btn-pen",
        "icon": "hi-pencil-semi",
        "action": "setmode('pen')",
    },
    "eraser": {
        "name": "eraser",
        "id": "tool-btn-eraser",
        "icon": "hi-eraser-semi",
        "action": "setmode('eraser')",
    },
    "fillBucket": {
        "name": "fillBucket",
        "id": "tool-btn-fillBucket",
        "icon": "hi-paint-bucket-semi",
        "action": "setmode('fillBucket')",
    },
    "line": {
        "name": "line",
        "id": "tool-btn-line",
        "icon": "hi-path-line",
        "action": "setmode('line')",
    },
    "ellipse": {
        "name": "ellipse",
        "id": "tool-btn-ellipse",
        "icon": "hi-circle-line",
        "action": "setmode('ellipse')",
    },
    "rectangle": {
        "name": "rectangle",
        "id": "tool-btn-rectangle",
        "icon": "hi-square-line",
        "action": "setmode('rectangle')",
    },
    "filledEllipse": {
        "name": "filledEllipse",
        "id": "tool-btn-filledEllipse",
        "icon": "hi-circle-fill",
        "action": "setmode('filledEllipse')",
    },
    "filledRectangle": {
        "name": "filledRectangle",
        "id": "tool-btn-filledRectangle",
        "icon": "hi-square-fill",
        "action": "setmode('filledRectangle')",
    },
    "sprayPaint": {
        "name": "sprayPaint",
        "id": "tool-btn-sprayPaint",
        "icon": "hi-spray-semi",
        "action": "setmode('sprayPaint')",
    },
    "rectangleMarquee": {
        "name": "rectangleMarquee",
        "id": "tool-btn-rectangleMarquee",
        "icon": "hi-marquee-line",
        "action": "setmode('sprayPaint')",
    },
    "ellipseMarquee": {
        "name": "ellipseMarquee",
        "id": "tool-btn-ellipseMarquee",
        "icon": "hi-circle-marquee-line",
        "action": "setmode('sprayPaint')",
    },
    "freehandSelect": {
        "name": "freehandSelect",
        "id": "tool-btn-freehandSelect",
        "icon": "hi-lasso-line",
        "action": "setmode('sprayPaint')",
    },
    "brushSelect": {
        "name": "brushSelect",
        "id": "tool-btn-brushSelect",
        "icon": "hi-freehand-select-line",
        "action": "setmode('sprayPaint')",
    },
    "magicWand": {
        "name": "magicWand",
        "id": "tool-btn-magicWand",
        "icon": "hi-magic-wand-line",
        "action": "setmode('sprayPaint')",
    },
}


var ToolbarAssignments = [{
        "type": "multiple",
        "name": "drawing",
        "default": "pen",
        "tools": ["pen", "sprayPaint"]
    },
    {
        "type": "single",
        "tool": "eraser"
    },
    {
        "type": "single",
        "tool": "fillBucket"
    },
    {
        "type": "multiple",
        "name": "shapes",
        "default": "ellipse",
        "tools": ["ellipse", "rectangle", "filledEllipse", "filledRectangle"]
    },
    {
        "type": "single",
        "tool": "line"
    },
    {
        "type": "multiple",
        "name": "selection",
        "default": "rectangleMarquee",
        "tools": ["rectangleMarquee", "ellipseMarquee", "freehandSelect", "brushSelect", "magicWand"]
    },

]

var toolPopInstances = {}

function createToolUI() {
    var wrapper = document.getElementById('dynamic-tool-wrap')
    ToolbarAssignments.forEach(t => {
        if (t.type == "single") {
            wrapper.innerHTML += `
            <span id="${ToolParams[t.tool].id}" data-tool-name="${ToolParams[t.tool].name}" class="item" onclick="${ToolParams[t.tool].action}"><i
            class="${ToolParams[t.tool].icon}"></i></span>`
        } else if (t.type == "multiple") {
            wrapper.innerHTML += `
            <span data-multiple-tool-name="${t.name}" id="${ToolParams[t.default].id}" 
            data-tool-name="${ToolParams[t.default].name}"
            class="item tool-multiple" onclick="${ToolParams[t.default].action}"><i
            class="${ToolParams[t.default].icon}"></i></span>
            `

            var dummyDiv = `<div id='tool-popup-${t.name}' class='tool-popup ui'>`

            t.tools.forEach(tl => {
                var tool = ToolParams[tl]
                console.log(tool.action)
                dummyDiv += `<span data-multiple-tool-parent="${t.name}" id="${tool.id}"
                data-tool-name="${tool.name}"
                class="item" onclick="setPopupTool('${t.name}','${tool.name}')"><i
                class="${tool.icon}"></i></span>`
            });

            dummyDiv += `</div>`
            wrapper.innerHTML += dummyDiv
            setTimeout(() => {

                var button = document.querySelector(`[data-multiple-tool-name="${t.name}"]`);
                var popup = document.querySelector(`#tool-popup-${t.name}`);

                toolPopInstances[t.name] = Popper.createPopper(button, popup, {
                    placement: "left",
                    modifiers: [{
                        name: 'offset',
                        options: {
                            offset: [0, 10],
                        },
                    }, ],
                });
                button.onmousedown = (e) => {
                    detectToolLongPress(e, popup, toolPopInstances[t.name])
                }

                button.ontouchstart = (e) => {
                    detectToolLongPress(e, popup, toolPopInstances[t.name])
                }

                button.onmouseup = (e) => {
                    cancelToolLongPress(e)
                }

                button.ontouchend = (e) => {
                    cancelToolLongPress(e)
                }
            }, 1);
        }
    });

}

var toolHoldTimeout;

function detectToolLongPress(e, popup, instance) {
    toolHoldTimeout = setTimeout(() => {
        closeAllToolPopups()
        popup.setAttribute('data-show', '');
        instance.update()
    }, 500);
}

function cancelToolLongPress(e, el) {
    clearTimeout(toolHoldTimeout)
}

function closeAllToolPopups() {
    document.querySelectorAll(".tool-popup").forEach(e => {
        e.removeAttribute("data-show")
    })
}


function updateToolSettings(tool) {
    var toolContent = document.getElementById("tool-settings-content")
    let toolSettings = settings.tools.assignments[tool]
    toolContent.classList.add("tool-settings-content-hidden")
    if (!toolSettings) {
        setTimeout(() => {
            toolContent.innerHTML = ``
            toolContent.style.setProperty("--maxHeight", "0px")
        }, 200);
        return
    }
    toolContent.style.setProperty("--maxHeight", (toolSettings.length * 28) + ((toolSettings.length - 1) * 8) + "px")
    let toolCont = ""
    for (let i = 0; i < toolSettings.length; i++) {
        const element = toolSettings[i];
        const setting = settings.tools[element]
        if (setting.type == "int") {
            toolCont += `
            <span class="tool-settings-ui-input-group">
              <p class="tool-settings-ui-input-title">${setting.title}</p>
              <div class="tool-settings-ui-input-wrap">
                <div class="tool-settings-ui-input-field">
                  <input data-input-filter min="${setting.min}" max="${setting.max}" ${(setting.draggable) ? "data-input-num-draggable" : ""} class="tool-settings-ui-input-num" onchange="console.log('a')" oninput="${setting.callback}" type="number" value="${setting.value}" />
                  <p class="tool-settings-ui-input-unit">${setting.unit}</p>
                </div>
              </div>
            </span>`
        } else if (setting.type == "bool") {
            toolCont += `
            <span class="tool-settings-ui-input-group">
              <p class="tool-settings-ui-input-title">${setting.title}</p>
              <div class="tool-settings-ui-input-wrap">
                <div class="tool-settings-ui-input-field">
                  <input class="tool-settings-ui-input-check" oninput="${setting.callback}" type="checkbox" ${(setting.value) ? "checked" : ""} />
                  <span class="checkmark"></span>
                </div>
              </div>
            </span>`
        }
    }
    if (toolContent.innerHTML == "") {
        toolContent.innerHTML = `${toolCont}`
        for (let i = 0; i < draggableNumInputs.length; i++) {
            const e = draggableNumInputs[i];
            e.clear()
        }
        draggableNumInputs = []
        document.querySelectorAll("[data-input-num-draggable]").forEach(e => {
            draggableNumInputs.push(new numberDraggable(e))
        })
        toolContent.classList.remove("tool-settings-content-hidden")
        return
    }
    setTimeout(() => {
        toolContent.innerHTML = `${toolCont}`
        for (let i = 0; i < draggableNumInputs.length; i++) {
            const e = draggableNumInputs[i];
            e.clear()
        }
        draggableNumInputs = []
        document.querySelectorAll("[data-input-num-draggable]").forEach(e => {
            draggableNumInputs.push(new numberDraggable(e))
        })
        toolContent.classList.remove("tool-settings-content-hidden")

    }, 150);
}


function setmode(tool, el) {
    closeAllToolPopups()
    Object.keys(Tools).forEach(v => Tools[v] = false)

    updateToolSettings(tool)

    Tools[tool] = true
    curCursor = settings.cursors[tool] || "crosshair"
    updateCursor()
    document.querySelectorAll("#toolbar .item").forEach((x) => {
        x.classList.remove('tool-active');
    })

    document.querySelectorAll(`[data-tool-name="${tool}"]`).forEach(e => {
        e.classList.add("tool-active")
    })
}

function setPopupTool(set, tool) {
    var toolParent = document.querySelector(`[data-multiple-tool-name="${set}"]`)
    toolParent.id = ToolParams[tool].id
    toolParent.setAttribute("data-tool-name", ToolParams[tool].name)
    toolParent.setAttribute("onclick", ToolParams[tool].action)
    toolParent.firstChild.className = ToolParams[tool].icon
    var fn = new Function("return " + ToolParams[tool].action);
    fn()
}