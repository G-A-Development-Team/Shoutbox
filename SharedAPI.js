function isMouseInArea(mouseX, mouseY, x, y, width, height) {
    return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
}

function GetPanelById(panelId) {
    var contextPanel = $.GetContextPanel()
    var panel = contextPanel.FindChildTraverse(panelId)
    return panel
}

function GetPanelFromPanel(contextPanel, panelId){
    var childCount = contextPanel.GetChildCount();
    
    // Loop through each child from last to first
    for (var i = childCount - 1; i >= 0; i--) {
        var child = contextPanel.GetChild(i);
        
        // Check if the child is valid
        if (child.id.toString() == panelId.toString()) {
            // Call DeleteAsync on the child
            return child
        }
    }
    return undefined;
}

function htmlToDataUri(html) {
    // Encode the HTML content
    const encodedHtml = encodeURIComponent(html);
    // Create the Data URI
    return `data:text/html;charset=utf-8,${encodedHtml}`;
}

function GetPositionFromPanel(panel){
    var posX = Number( panel.style.position.split( ' ' )[ 0 ].split( 'px' )[ 0 ] )
    var posY = Number( panel.style.position.split( ' ' )[ 1 ].split( 'px' )[ 0 ] )
    return {x: posX, y: posY}
}

function SetPositionFromPanel(panel, x, y){
    panel.style["position"] = x + "px " + y + "px" + " 0px"
}

function GetSizeFromPanel(panel){
    var width = Number( panel.style.width.split( 'px' )[ 0 ] )
    var height = Number( panel.style.height.split( 'px' )[ 0 ] )
    return {width: width, height: height}
}

var Aimware = {
    KeyBinds: {
        tilde: [],
    },
    Files: {

    },
    BindPanelToKey: function(key, panel){
        this.KeyBinds[key].push(panel);
    },
    ReadFile: function(key, path, type){
        this.Files[key] = {
            Path: path,
            Content: undefined,
        }
    },
    GetFileContent: function(key){
        if(this.Files[key]){
            return this.Files[key].Content;
        }
    }
}

var AimwareEvents = {
    Events: {
        onmousedown: [],
        onenterkey: [],
        loop: [],
    },
    RegisterEvent: function(event, callback){
        this.Events[event].push(callback);
    },
    UnregisterEvents: function(){
        for(var event in this.Events){
            this.Events[event] = []
        }
    }
}

var SharedUI = {
    CreatedPanels: {},
    CreateCustomConsole: function(name, title){
        var panel = $.CreatePanel('Panel', $.GetContextPanel(), name)
        panel.BLoadLayout("file://{resources}/layout/console.xml", false, false)
        panel.style["width"] = "1000px"
        panel.style["height"] = "800px"
        panel.style["position"] = "10px 15px 0px"
        panel.visible = false

        var panel_title = panel.FindChildTraverse("Title")
        panel_title.text = title

        var panel_header = panel.FindChildTraverse("Header")

        var isDragging = false;
        var startX, startY, initialLeft, initialTop;

        // Variables for resizing
        var isResizing = false;
        var resizeStartX, resizeStartY, initialPanelWidth, initialPanelHeight = 0;

        panel_header.SetPanelEvent("onmousedown", function () {
            isDragging = true;
            startX = mouseX;
            startY = mouseY;

            var pos = GetPositionFromPanel(panel)
            initialLeft = pos.x
            initialTop = pos.y
        })

        AimwareEvents.RegisterEvent("onmousedown", function (){
            if (isDragging) {
                var newX = parseInt(initialLeft) + (mouseX - startX)
                var newY = parseInt(initialTop) + (mouseY - startY)
                SetPositionFromPanel(panel, newX, newY)
            } else if (isResizing) {
                var newWidth = Math.max(initialPanelWidth + (mouseX - resizeStartX), 100); // Minimum width
                var newHeight = Math.max(initialPanelHeight + (mouseY - resizeStartY), 100); // Minimum height
                panel.style["width"] = newWidth + "px";
                panel.style["height"] = newHeight + "px";
            }
        })

        panel.SetPanelEvent("onmouseup", function () {
            isDragging = false;
            isResizing = false;
        })

        var panel_dragTarget = panel.FindChildTraverse("ResizeDragTarget")

        // Handle mouse down for resizing
        panel_dragTarget.SetPanelEvent("onmousedown", function () {
            isResizing = true;
            resizeStartX = mouseX;
            resizeStartY = mouseY;

            // Get the initial dimensions of the panel
            initialPanelWidth = parseInt(panel.style["width"]);
            initialPanelHeight = parseInt(panel.style["height"]);
        })

        var panel_consoleText = panel.FindChildTraverse("ConsoleLog")
        panel_consoleText.style["flow-children"] = "down"

        var panel_input = panel.FindChildTraverse("ConsoleInput")
        AimwareEvents.RegisterEvent("onenterkey", function (){
            if(panel_input.BHasKeyFocus()){
                var consoletext = panel.FindChildTraverse("ConsoleLog")
                var newInput = $.CreatePanel('Label', consoletext, panel_input.text)
                newInput.text = ">  " + panel_input.text
                panel_input.text = ""
                newInput.style["height"] = "17px"
                newInput.style["color"] = "#ccc"
                newInput.style["font-size"] = "14px"
                newInput.style["font-family"] = "Courier New,Courier"
                panel_consoleText.ScrollToBottom()
            }
        })

        panel_input.SetPanelEvent("onmousedown", function () {
            panel_input.SetFocus(true)
        })

        var panel_closeButton = panel.FindChildTraverse("CloseButton")
        panel_closeButton.SetPanelEvent("onmousedown", function () {
            panel.visible = false
        })

        this.CreatedPanels[name] = {
            Panel: panel,
            Write: function(color, text) {
                var consoletext = panel.FindChildTraverse("ConsoleLog")
                var newInput = $.CreatePanel('Label', consoletext, panel_input.text)
                newInput.text = text
                newInput.style["height"] = "17px"
                newInput.style["color"] = color
                newInput.style["font-size"] = "14px"
                newInput.style["font-family"] = "Courier New,Courier"
                panel_consoleText.ScrollToBottom()
            }
        }
        return this.CreatedPanels[name]
    },

    CreateHUDChat: function(name, title){
        // Get the current context panel
        var panel = $.GetContextPanel().GetChild(0);

        // Get all child panels
        var children = panel.Children();
        var HudChatPanel = undefined;
        // Loop through each child and print its ID
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if(child.id === "HudChat"){
                HudChatPanel = child
            }
        }

        if(!HudChatPanel) {
            $.Msg("Hud not found")
            return undefined;
        }

        var panel = $.CreatePanel('Panel', HudChatPanel, name)
        panel.BLoadLayout("file://{resources}/layout/hud/hudchat.xml", false, false)
        //panel.style["position"] = "800px 15px 0px"
        panel.style["width"] = "100%"
        panel.style["height"] = "100%"
        panel.style["visibility"] = "collapse"
        panel.visible = true

        var panel_container = panel.FindChildTraverse("ChatContainer")
        panel_container.style["horizontal-align"] = "right"

        panel.FindChildTraverse("ChatTextEntryBox").DeleteAsync(0)
        panel.FindChildTraverse("ChatSendButton").DeleteAsync(0)

        var entry_container = panel.FindChildTraverse("ChatTextEntryFG")

        var textEntry = $.CreatePanel('TextEntry', entry_container, "ChatTextEntryBox", {
            id: 'ChatTextEntryBox',
            class: 'stratum-regular',
            placeholder: 'Say to Aimware Cheaters',
            maxchars: '127'
        })
        var focused = false

        textEntry.SetPanelEvent("onmousedown", function () {
            textEntry.SetFocus(true)
            focused = true
        })

        AimwareEvents.RegisterEvent("onmousedown", function (){
            try {
                if(textEntry){
                    if(textEntry.visible && focused){
                        textEntry.SetFocus(false)
                        focused = false
                    }
                }
              }
              catch(err) {
            }
        })

        AimwareEvents.RegisterEvent("onenterkey", function (){
            if(textEntry){
                if(textEntry.BHasKeyFocus()){
                    if(SharedUI.CreatedPanels[name].CancelInput){
                        
                    } else {
                        var lblpanel = $.CreatePanel('Label', LabelContainer, "label_" + textEntry.text, {
                            class: 'stratum-bold',
                            acceptsfocus: 'true',
                            text: textEntry.text
                        });
                        lblpanel.style["color"] = "red"
                    }
                    SharedUI.CreatedPanels[name].OnChat(textEntry.text)
                    $.DispatchEvent( "CSGOPlaySoundEffect", "ItemDropLegendary", "MOUSE" );
                    textEntry.text = ""
                    var history_container = panel.FindChildTraverse("chathistory")
                    
                    HudChatPanel.SetFocus(false)
                    var delay = 0
                    
                    AimwareEvents.RegisterEvent("loop", function (){
                        if(delay == 15){
                            history_container.ScrollToBottom();
                        }
                        delay += 1
                    })
                }
            }
        })

        var sendButton = $.CreatePanel('TextButton', entry_container, "ChatSendButton")
        sendButton.id = "ChatSendButton"
        sendButton.AddClass("stratum-medium")
        sendButton.text = "SEND"

        panel.FindChildTraverse("ChatHistoryBG").DeleteAsync(0)
        panel.FindChildTraverse("ChatHistoryText").DeleteAsync(0)

        var history_container = panel.FindChildTraverse("ChatHistory")

        $.CreatePanel('Panel', history_container, "ChatHistoryBG", {
            class: 'ChatTextBG'
        })

        var LabelContainer = $.CreatePanel('Panel', history_container, "chathistory", {
            acceotsfocus: 'true',
            class: 'vscroll'
        })

        LabelContainer.style["flow-children"] = "down"
        LabelContainer.style["background-color"] = "#00000099"
        LabelContainer.style["letter-spacing"] = "0px"
        LabelContainer.style["font-size"] = "18px"
        LabelContainer.style["padding"] = "10px"
        LabelContainer.style["width"] = "100%"
        LabelContainer.style["height"] = "100%"


        this.CreatedPanels[name] = {
            Panel: panel,
            Write: function(text) {
                var lblpanel = $.CreatePanel('Label', LabelContainer, "label_" + text, {
                    class: 'stratum-bold',
                    acceptsfocus: 'true',
                    text: text,
                    html: 'true',
                });

                $.DispatchEvent( "CSGOPlaySoundEffect", "ItemDropLegendary", "MOUSE" );
                textEntry.text = ""
                var history_container = panel.FindChildTraverse("chathistory")
                
                //HudChatPanel.SetFocus(false)
                var delay = 0
                
                AimwareEvents.RegisterEvent("loop", function (){
                    if(delay == 15){
                        history_container.ScrollToBottom();
                    }
                    delay += 1
                })
            },
            CancelInput: true,
            OnChat: function(){
                $.Msg("thisone")
                // Called when the text entry box is submitted
                // You can add your own logic here
            }
        }
        return this.CreatedPanels[name]
    },

    CreateWindow: function(name, title){
        var panel = $.CreatePanel('Panel', $.GetContextPanel(), name)
        panel.BLoadLayout("file://{resources}/layout/console.xml", false, false)
        panel.style["width"] = "1000px"
        panel.style["height"] = "800px"
        panel.style["position"] = "10px 15px 0px"
        panel.visible = false

        var panel_title = panel.FindChildTraverse("Title")
        panel_title.text = title

        var panel_header = panel.FindChildTraverse("Header")

        var isDragging = false;
        var startX, startY, initialLeft, initialTop;

        // Variables for resizing
        var isResizing = false;
        var resizeStartX, resizeStartY, initialPanelWidth, initialPanelHeight = 0;

        panel_header.SetPanelEvent("onmousedown", function () {
            isDragging = true;
            startX = mouseX;
            startY = mouseY;

            var pos = GetPositionFromPanel(panel)
            initialLeft = pos.x
            initialTop = pos.y
        })

        AimwareEvents.RegisterEvent("onmousedown", function (){
            if (isDragging) {
                var newX = parseInt(initialLeft) + (mouseX - startX)
                var newY = parseInt(initialTop) + (mouseY - startY)
                SetPositionFromPanel(panel, newX, newY)
            } else if (isResizing) {
                var newWidth = Math.max(initialPanelWidth + (mouseX - resizeStartX), 100); // Minimum width
                var newHeight = Math.max(initialPanelHeight + (mouseY - resizeStartY), 100); // Minimum height
                panel.style["width"] = newWidth + "px";
                panel.style["height"] = newHeight + "px";
            }
        })

        panel.SetPanelEvent("onmouseup", function () {
            isDragging = false;
            isResizing = false;
        })

        var panel_dragTarget = panel.FindChildTraverse("ResizeDragTarget")

        // Handle mouse down for resizing
        panel_dragTarget.SetPanelEvent("onmousedown", function () {
            isResizing = true;
            resizeStartX = mouseX;
            resizeStartY = mouseY;

            // Get the initial dimensions of the panel
            initialPanelWidth = parseInt(panel.style["width"]);
            initialPanelHeight = parseInt(panel.style["height"]);
        })

        var panel_consoleText = panel.FindChildTraverse("ConsoleLog")
        panel_consoleText.DeleteAsync(0)

        var panel_input = panel.FindChildTraverse("ConsoleInput")
        panel_input.DeleteAsync(0)

        var panel_closeButton = panel.FindChildTraverse("CloseButton")
        panel_closeButton.SetPanelEvent("onmousedown", function () {
            panel.visible = false
        })

        this.CreatedPanels[name] = {
            Panel: panel,
            
        }
        return this.CreatedPanels[name]
    },

    CreateBrowser: function(name, title, context){
        var panel = $.CreatePanel('Panel', context || $.GetContextPanel(), name)
        panel.BLoadLayout("file://{resources}/layout/console.xml", false, false)
        panel.style["width"] = "1000px"
        panel.style["height"] = "800px"
        panel.style["position"] = "10px 15px 0px"
        panel.visible = false

        var panel_title = panel.FindChildTraverse("Title")
        panel_title.text = title

        var panel_header = panel.FindChildTraverse("Header")

        var isDragging = false;
        var startX, startY, initialLeft, initialTop;

        // Variables for resizing
        var isResizing = false;
        var resizeStartX, resizeStartY, initialPanelWidth, initialPanelHeight = 0;

        panel_header.SetPanelEvent("onmousedown", function () {
            isDragging = true;
            startX = mouseX;
            startY = mouseY;

            var pos = GetPositionFromPanel(panel)
            initialLeft = pos.x
            initialTop = pos.y
        })

        AimwareEvents.RegisterEvent("onmousedown", function (){
            if (isDragging) {
                var newX = parseInt(initialLeft) + (mouseX - startX)
                var newY = parseInt(initialTop) + (mouseY - startY)
                SetPositionFromPanel(panel, newX, newY)
            } else if (isResizing) {
                var newWidth = Math.max(initialPanelWidth + (mouseX - resizeStartX), 100); // Minimum width
                var newHeight = Math.max(initialPanelHeight + (mouseY - resizeStartY), 100); // Minimum height
                panel.style["width"] = newWidth + "px";
                panel.style["height"] = newHeight + "px";
            }
        })

        panel.SetPanelEvent("onmouseup", function () {
            isDragging = false;
            isResizing = false;
        })

        var panel_dragTarget = panel.FindChildTraverse("ResizeDragTarget")

        // Handle mouse down for resizing
        panel_dragTarget.SetPanelEvent("onmousedown", function () {
            isResizing = true;
            resizeStartX = mouseX;
            resizeStartY = mouseY;

            // Get the initial dimensions of the panel
            initialPanelWidth = parseInt(panel.style["width"]);
            initialPanelHeight = parseInt(panel.style["height"]);
        })

        var panel_consoleText = panel.FindChildTraverse("ConsoleLog")
        panel_consoleText.DeleteAsync(0)

        var panel_input = panel.FindChildTraverse("ConsoleInput")
        panel_input.DeleteAsync(0)

        var panel_closeButton = panel.FindChildTraverse("CloseButton")
        panel_closeButton.SetPanelEvent("onmousedown", function () {
            panel.visible = false
        })

        var mainContent = panel.FindChildTraverse("MainContents")

        var htmlPanel = $.CreatePanel('HTML', mainContent, "html")
        htmlPanel.id = "html"
        htmlPanel.style["width"] = "100%"
        htmlPanel.style["height"] = "fill-parent-flow( 1.0 )"

        htmlPanel.SetURL("about:blank")
        htmlPanel.SetIgnoreCursor(false)
        htmlPanel.BAcceptsFocus(true)
        htmlPanel.SetAcceptsFocus(true)
        htmlPanel.SetReadyForDisplay(false)
        htmlPanel.BAcceptsInput(true)
        panel.defaultfocus = "html"

        panel.SetPanelEvent("onmousedown", function () {
            htmlPanel.SetFocus(true)
        })


        this.CreatedPanels[name] = {
            Panel: panel,
            LoadHTML: function(content){
                try {
                    if(htmlPanel){
                        htmlPanel.SetURL(htmlToDataUri(content))
                    }
                  }
                  catch(err) {
                }
            },
            RunJavaScript: function(content){
                try {
                    if(htmlPanel){
                        htmlPanel.RunJavascript(content)
                    }
                  }
                  catch(err) {
                }
            },
            LoadURL: function(url){
                if(htmlPanel){
                    htmlPanel.SetURL(url)
                }
            },
            HideBars: function(){
                var header = panel.FindChildTraverse("Header")
                header.DeleteAsync(0)
                var panel_dragTarget = panel.FindChildTraverse("ResizeDragTarget")
                panel_dragTarget.DeleteAsync(0)
            },
            ScrollToBottom: function(){
                htmlPanel.ScrollToBottom()
                panel.ScrollToBottom()
                mainContent.ScrollToBottom()
            }
        }
        return this.CreatedPanels[name]
    },

    UnregisterPanels: function() {
        for (var name in this.CreatedPanels) {
            if (this.CreatedPanels.hasOwnProperty(name)) {
                var panel = this.CreatedPanels[name].Panel;
                panel.DeleteAsync(0); // Asynchronously delete the panel
                delete this.CreatedPanels[name]; // Remove from the CreatedPanels object
            }
        }
    }
}
