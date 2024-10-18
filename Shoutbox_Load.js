

// Get the current context panel
var panel = $.GetContextPanel().GetChild(0);

// Get all child panels
var children = panel.Children();
// Loop through each child and print its ID
for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if(child.id === "HudChat"){
        var childrenInsideChild = child.Children();
        for (var j = 0; j < childrenInsideChild.length; j++) {
            var ks = child.Children()[j];
            $.Msg(ks.id)
            if(ks.id === "shoutbox_hud"){
                ks.DeleteAsync(0)
            }
        }
    }
}


function onLoad(context){
    var browser = SharedUI.CreateBrowser("browser", "Browser", context)

    browser.LoadURL("https://aimware.net/forum")
    browser.Panel.visible = true
    browser.Panel.style["width"] = "100%"
    browser.Panel.style["height"] = "100%"
    browser.Panel.style["padding"] = "0px"
    browser.Panel.style["position"] = "0px 0px 0px"
    browser.HideBars()

    var loginDelay = 0
    var shoutBoxDelay = 0
    var scrollDelay = 0
    var delay = 0
    
    AimwareEvents.RegisterEvent("loop", function (){
        if(delay == 200){
            browser.RunJavaScript(`
                const h1Exists = document.querySelector('h1.section-title')?.textContent.trim() === 'Login';
    
                if (h1Exists) {
                    // Remove the <h1> element with the class 'section-title'
                    const sectionTitle = document.querySelector('h1.section-title');
                    if (sectionTitle) {
                        sectionTitle.remove();
                    }

                    // Remove the <header> element with the class 'header'
                    const header = document.querySelector('header.header');
                    if (header) {
                        header.remove();
                    }

                    // Remove the <footer> element with the class 'footer'
                    const footer = document.querySelector('footer.footer');
                    if (footer) {
                        footer.remove();
                    }
                }
                const shoutboxDiv = document.querySelector('.section-forum-top h2');

                // Check if the element exists and its content matches "Shoutbox"
                if (shoutboxDiv && shoutboxDiv.textContent === 'Shoutbox') {
                    const chatList = document.getElementById('chat-list');
                    
                    // Check if the chat-list exists
                    if (chatList) {
                        // Create a new container to hold the chat-list
                        const container = document.createElement('div');
                        container.appendChild(chatList);
                        chatList.style.height = '';
                        chatList.style.fontSize = '16px';
                        
                        // Clear the body and append the container with chat-list
                        document.body.innerHTML = '';
                        document.body.appendChild(container);
                        chatList.scrollTop = chatList.scrollHeight;
                    } else {
                        console.warn('Chat list not found!');
                    }
                } else {
                    console.log('The shoutbox does not exist.');
                }
                // Select the span element by its class
                const homeIcon = document.querySelector('span.fa.fa-home');

                // Check if the element exists
                if (homeIcon) {
                    console.log('The home icon exists.');
                    // Redirect to another URL
                    window.location.href = 'https://aimware.net/forum';
                } else {
                    console.log('The home icon does not exist.');
                }

                if (shoutbox.socket && shoutbox.status === 'connected') {
                } else {
                    shoutbox.socket = new WebSocket(shoutbox.url);
                    shoutbox.socket.onmessage = shoutbox.ui.io.message;
                    shoutbox.socket.onopen = shoutbox.ui.io.open;
                    shoutbox.socket.onclose = shoutbox.ui.io.close;
                }
            `)
            delay = 0
        }
        if(loginDelay == 100){
          browser.RunJavaScript(`
                const h1Exists = document.querySelector('h1.section-title')?.textContent.trim() === 'Login';

                if (h1Exists) {
                } else {
                    document.body.style.backgroundColor = '#00000099';
                    const loginButton = document.querySelector('.button-base.button-user-top[href="/forum/user/login"]');
                    if (loginButton) {
                        loginButton.click(); // Simulate click on the login button
                    }
                }
            `)
        }

        if(shoutBoxDelay == 400){
            browser.RunJavaScript(`
                const chatList = document.getElementById('chat-list');
                
                // Check if the chat-list exists
                if (chatList) {
                    // Create a new container to hold the chat-list
                    const container = document.createElement('div');
                    container.appendChild(chatList);
                    chatList.style.height = '';
                    chatList.style.fontSize = '16px';
                    
                    // Clear the body and append the container with chat-list
                    document.body.innerHTML = '';
                    document.body.appendChild(container);
                    chatList.scrollTop = chatList.scrollHeight;
                } else {
                    console.warn('Chat list not found!');
                }
            `)
            
        }
        if(scrollDelay == 450){
            browser.ScrollToBottom()
        }
        if(delay >= 200){
            delay = 0
        } else {
            delay += 1
        }
        scrollDelay += 1
        shoutBoxDelay += 1
        loginDelay += 1
    })

}
AimwareEvents.RegisterEvent("loop", function (){
    // Get the current context panel
    var panel2 = $.GetContextPanel().GetChild(0);

    // Get all child panels
    var children2 = panel2.Children();
    // Loop through each child and print its ID
    for (var i = 0; i < children2.length; i++) {
        var child = children2[i];
        if(child.id === "HudChat"){
            var childrenInsideChild = child.Children();
            var contains = false
            for (var j = 0; j < childrenInsideChild.length; j++) {
                var ks = child.Children()[j];
                if(ks.id === "shoutbox_hud"){
                    contains = true
                }
            }
            if(!contains){
                var chat = SharedUI.CreateHUDChat("shoutbox_hud", "Hud")
                var container = chat.Panel.FindChildTraverse("ChatHistory")
                
                chat.OnChat = function(msg){
                    $.Msg("sent msg")
                    SharedUI.CreatedPanels["browser"].RunJavaScript(`
                        shoutbox.call.message.send("[LUA] ` + msg + `");
                    `)
                }
                
                //chat.Write("<font color=\"#9900FF\">Rosie</font><font color=\"#234FFF\"> Test</font>")
                
                onLoad(container)
            }
        }
    }
})
