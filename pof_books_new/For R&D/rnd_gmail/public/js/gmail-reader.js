$(function() {
    /* Add this to your html header
    <script src="https://apis.google.com/js/client.js?onload=checkAuth"></script>
    */

    // Your Client ID can be retrieved from your project in the Google
    // Developer Console, https://console.developers.google.com
    var CLIENT_ID = '<YOUR CLIENT ID>';

    var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

    /**
    * Check if current user has authorized this application.
    */
    function checkAuth() {
    gapi.auth.authorize(
        {
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
        }, handleAuthResult);
    }

    /**
    * Handle response from authorization server.
    *
    * @param {Object} authResult Authorization result.
    */
    function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
            // Hide auth UI, then load client library.
            authorizeDiv.style.display = 'none';
            loadGmailApi();
        } else {
            // Show auth UI, allowing the user to initiate authorization by
            // clicking authorize button.
            authorizeDiv.style.display = 'inline';
        }
    }

    /**
    * Initiate auth flow in response to user clicking authorize button.
    *
    * @param {Event} event Button click event.
    */
    function handleAuthClick(event) {
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            handleAuthResult);
        return false;
    }

    /**
    * Load Gmail API client library. List labels once client library
    * is loaded.
    */
    function loadGmailApi() {
        gapi.client.load('gmail', 'v1', listMessages);
    }

    /**
    * List all unread messages and load the email with subject equivalent to Tax Return Receipt Confirmation
    */
    function listMessages() {
        gapi.client.gmail.users.messages.list({
            'userId': 'me',
            'q' : 'in:inbox is:unread category:primary'
        }).then(function(response) {
            $.each(response.result.messages, function(index, value) {
                /* Fetching File name, date and time received */
                let id = value.id
                gapi.client.gmail.users.messages.get({
                    'userId': 'me',
                    'id': id, // Message ID
                }).then(function(res) {
                    $.each(res.result.payload.headers, function(index, value) {
                        if(value.name === "Subject" && value.value === "Tax Return Receipt Confirmation"){
                            gapi.client.gmail.users.messages.get({
                                'userId': 'me',
                                'id': id,
                                'format': 'raw'
                            }).then(function(resp) {
                                var rawMessage = atob(resp.result.raw.replace(/-/g, '+').replace(/_/g, '/')); // Conversion of Base 64 if the source is gmail.
                                var arr = rawMessage.split(':'); // Split by colon
                                var newArr = [];
                                var filenameArrIndex = 0;
                                $.each(arr, function(key, value) {
                                    newArr.push(value.trim());
                                    if(filenameArrIndex === 0) {
                                        filenameArrIndex = value.includes(".xml") ? key : 0; // Check if value includes .xml
                                    }
                                })
                                var filename = newArr[filenameArrIndex];
                                var arrFileName = filename.split(/\s+/g); // Split by space
                                var finalFileName = arrFileName[0]; // Actual File Name
                                console.log('File Received: ', finalFileName);

                                var dateReceived = newArr[++filenameArrIndex];
                                var arrDate = dateReceived.split(/\s+/g);
                                var finalDate = [arrDate[1], arrDate[0], arrDate[2]].join(' '); // Actual Date
                                console.log('Date Received: ', finalDate);

                                var hourReceived = newArr[++filenameArrIndex]; // Actual Hour
                                var minuteReceived = newArr[++filenameArrIndex];
                                var arrMinute = minuteReceived.split(/\s+/g);
                                var finalMinute = [arrMinute[0], arrMinute[1]].join(' '); // Actual Minute

                                var actualTimeReceived = [hourReceived,finalMinute].join(':'); // Concat hour and minute received
                                console.log('Time Received: ', actualTimeReceived);
                                console.log('==================')
                            })
                        }
                    })
                })
            })
        });
    }
})
