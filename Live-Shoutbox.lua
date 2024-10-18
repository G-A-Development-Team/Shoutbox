function LoadJs(jsfile)
    local jsFile = file.Open(jsfile, "r")
    local text = jsFile:Read();
    jsFile:Close();
    panorama.RunScript(text)
end

function HttpLoadJS(url)
    local text = http.Get(url)
    panorama.RunScript(text)
end

function ReadFile(path)
    local jsFile = file.Open(path, "r")
    local text = jsFile:Read();
    jsFile:Close();
    return text
end

panorama.RunScript([[
    var mouseX = 0
    var mouseY = 0
]])

local function Load()
    print("Loaded Shoutbox")
    local shared = http.Get("https://raw.githubusercontent.com/G-A-Development-Team/Shoutbox/refs/heads/main/SharedAPI.js")
    panorama.RunScript(shared)

    local data = http.Get("https://raw.githubusercontent.com/G-A-Development-Team/Shoutbox/refs/heads/main/Shoutbox_Load.js")
    panorama.RunScript(data)
end

local function Unload()
    HttpLoadJS("https://raw.githubusercontent.com/G-A-Development-Team/Shoutbox/refs/heads/main/Shoutbox_Unload.js")
end

callbacks.Register("Unload", function()
	Unload();
    callbacks.Unregister("Draw", "shoutbox")
end)

callbacks.Register("Draw", "shoutbox", function()
    local X, Y = input.GetMousePos()

    local script = ""

    script = script .. [[
        mouseX = ]].. X .. [[;
        mouseY = ]].. Y .. [[;

    ]]

    if input.IsButtonDown(1) then
        script = script .. [[
            try{
                for (const event in AimwareEvents.Events) {
                    if(event == "onmousedown"){
                        AimwareEvents.Events[event].forEach((callback, index) => {
                            callback()
                        })
                    }
                }
            }catch(err){
            
            }
        ]]
    end

    if input.IsButtonPressed(13) then
        script = script .. [[
            try{
                for (const event in AimwareEvents.Events) {
                    if(event == "onenterkey"){
                        AimwareEvents.Events[event].forEach((callback, index) => {
                            callback()
                        })
                    }
                }
            }catch(err){
            
            }
        ]]
    end

    if input.IsButtonPressed(192) then
        script = script .. [[
            try{
                for (const key in Aimware.KeyBinds) {
                    if(key == "tilde"){
                        Aimware.KeyBinds[key].forEach((panel, index) => {
                            panel.visible = !panel.visible
                        })
                    }
                }
            }catch(err){
            
            }
        ]]
    end

    script = script .. [[
        try{
            for (const event in AimwareEvents.Events) {
                if(event == "loop"){
                    AimwareEvents.Events[event].forEach((callback, index) => {
                        callback()
                    })
                }
            }
        }catch(err){
        
        }
    ]]

    panorama.RunScript(script)
end)

Load()
