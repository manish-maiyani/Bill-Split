var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
var IPAddress = "http://100.103.109.184:3000";
var email = null;
var UserName = null;
var name;
var checkedNames;
var billData = null;
var flag=true;

function logout()
{
    $("#lemail").val("");
    $("#lpassword").val("");
    $.mobile.changePage("index.html#login");
}

function login() 
{
    
    if ($("#lemail").val() == "") {
        alert("Please enter E-mail!");
    }
    else if (!regex.test($("#lemail").val())) {
        alert("Please enter valid E-mail!");
        $("#lemail").val("");
    }
    else if ($("#lpassword").val() == "") {
        alert("Please enter Password!");
    }
    else {
        const url = IPAddress + "/login/email/" + $("#lemail").val() + "/password/" + $("#lpassword").val();
        $.ajax({
            type: "GET",
            datatype: "json",
            url: url,
            success: function (data) {
                if (data) {
                    // username = data[0].firstname + " " +data[0].lastname;
                    try {
                        email = data[0].email;
                        UserName = data[0].firstname + " " + data[0].lastname;
                        if ($("#lemail").val() == data[0].email && $("#lpassword").val() == data[0].email);
                        {
                            $.mobile.changePage("index.html#bills");
                        }
                    }
                    catch (error) {
                        alert("Incorrect Username and Password!");
                    }


                }
            },
            error: function (err) {
                alert("Incorrect Username & Password!");
            }
        });
    }
}

function signUp() {
    if ($("#firstName").val() == "") {
        alert("Please enter first name!");
    }
    else if ($("#lastName").val() == "") {
        alert("Please enter last name!");
    }
    else if ($("#email").val() == "") {
        alert("Please enter E-mail!");
    }
    else if (!regex.test($("#email").val())) {
        alert("Please enter valid E-mail!");
        $("#email").val("");
    }
    else if ($("#password").val() == "") {
        alert("Please enter Password!");
    }
    else if ($("#conpassword").val() == "") {
        alert("Please enter confirm password!");
    }
    else if ($("#conpassword").val() != $("#password").val()) {
        alert("Password does not match! \n Please try again!");
        $("#conpassword").val("");
        $("#password").val("");
    }
    else {
        var signUpData =
        {
            firstname: $("#firstName").val(),
            lastname: $("#lastName").val(),
            email: $("#email").val(),
            password: $("#password").val()
        }

        const url = IPAddress + "/signup";

        $.ajax({
            type: "POST",
            datatype: "json",
            url: url,
            data: signUpData,
            success: function (data) {
                alert("Sign up successful");
                $.mobile.changePage("index.html#login");
            },
            error: function (err) {
                alert("Somthing went wrong! \nPlease try again");
            }
        });
    }
}

$(document).on("pageshow", "#newgroup", function () {

    const url = IPAddress + "/loadusers";
    $.ajax({
        type: "GET",
        datatype: "json",
        url: url,
        success: function (data) {
            if (data) {
                $("#memberlist").empty();
                $("#memberlist").append('<li data-role="list-divider"><h1>Select group members</h1></li>');
                loadUsers(data);
                $('#memberlist').listview('refresh');
            }
        },
        error: function (err) {
            alert(JSON.stringify(err));
        }
    });
});

$(document).on("pageshow", "#bills", function () 
{
    $("#uname").empty();
    $("#uname").append("Hi, "+UserName);
    $("#loadedbills").empty();
    $("#billamount").val("");
    $("#cloudbills").empty();
    // $("#cloudbills").listview("refresh");
    $("#des").val("");
    const url = IPAddress + "/loadusers";
    $.ajax({
        type: "GET",
        datatype: "json",
        url: url,
        success: function (data) {
            if (data) 
            {
                    $("#memberlist").empty();
                    $("#memberlist").append('<li data-role="list-divider"><h1>Select member to split</h1></li>');
                    loadUsers(data);
                    $('#memberlist').listview('refresh');
            }
        },
        error: function (err) {
            alert(JSON.stringify(err));
        }
    });
});

function loadUsers(data) 
{
    var flag = true;
    for (var i = 0; i < data.length; i++) 
    {
        if(email != data[i].email)
        {
            name = data[i].firstname + ' '+ data[i].lastname;
            $("#memberlist").append('<li><label><input type="checkbox" class="check" id="'+data[i].name+'" name="'+name+'">'+name+'</label></li>');
            name = "";
            flag = false;
        }
    }
    if(flag)
    {
        alert("There are no users available\nYou can not add bills");
        $.mobile.changePage("index.html#login");
    }
}

function addBill()
{
    checkedNames = $(".check:checked").map(function() 
    {
        return this.name;
    }).toArray();
    if($("#billamount").val() == "")
    {
        alert("Please enter bill amount!");
    }
    else if($("#billamount").val() <= 0)
    {
        alert("Bill amount should be more than 0");
    }
    else if($("#des").val() == "")
    {
        alert("Please enter description!");
    }
    else if(checkedNames.length != 0)
    {
        var splitamount = (($("#billamount").val())/(checkedNames.length+1)).toFixed(2);
        
        billData  = {
            billamount: $("#billamount").val(),
            billdesc: $("#des").val(),
            }
            var i;
            var members="";
            members += UserName+", ";
            for( i=0; i<checkedNames.length; i++)
            {
                if(i < checkedNames.length-1)
                {
                    members += checkedNames[i]+", ";
                }
                else
                {
                    members += checkedNames[i];
                }
            }
            billData["members"] = members;
            billData["splitamount"] = splitamount;
            var d = new Date($.now());
            billData["payer"] = UserName;
            billData["date"] = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            billData["time"] = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            billData["totalMember"] = i+1;
            
            var bill = JSON.parse(localStorage.getItem('bills') || '[]');
            bill.push(billData);
            window.localStorage.setItem('bills', JSON.stringify(bill));

            alert("Data added to localstorage\n" + JSON.stringify(billData));
            
            $("#billamount").val("");
            $("#des").val("");
            $('input[type="checkbox"]').removeAttr('checked');
    }
    else
    {
        alert("Please select at least one member!");
    }
}
 function send()
 {
    var tempBillData = JSON.parse(localStorage.getItem('bills'));
    if (tempBillData == null) 
    {
        alert("No Bills found! Please add some bills to send ");
        $.mobile.changePage("index.html#bills");
    }
    else {
        for (var i = 0; i < tempBillData.length; i++) 
        {
            const url = IPAddress + "/addbill";

            $.ajax({
                type: "POST",
                datatype: "json",
                url: url,
                data: tempBillData[i],
                success: function (data) {
                    
                    $.mobile.changePage("index.html#bills");
                },
                error: function (err) {
                    alert("Somthing went wrong! \nPlease try again");
                }
            });
        }
        alert("Bill added successful");
        localStorage.removeItem('bills');
    }

 }

 $(document).on("pageshow", "#expenses", function () 
{
    //$('input[type="radio"]').removeAttr('checked');
    $("#loadedbills").empty();
    var billsInLocal = JSON.parse(localStorage.getItem('bills'));
    if (billsInLocal) 
    {
        $("#extitle").empty();
        loadBills(billsInLocal);
    }
    else
    {
        $("#extitle").empty();
        $.mobile.changePage("index.html#expenses");
        $("#extitle").append("There is no data in localStorage!");
    }
});

function loadBills(reqData)
{   
    var counter = 1;
    for (var i = 0; i < reqData.length; i++) 
        {
            var mem = reqData[i].members.split(", ");
            for(var j=0; j<mem.length; j++)
            {
                if(mem[j] != UserName)
                {
                    continue;
                }
                else
                {
                    $("#loadedbills").append('<li data-role="list-divider"><h1>Bill '+(counter)+'</h1></li>');
                    $("#loadedbills").append('<li>Bill Amount: '+reqData[i].billamount+'</li>');   
                    $("#loadedbills").append('<li>Bill Description: '+reqData[i].billdesc+'</li>');   
                    $("#loadedbills").append('<li>Members: '+reqData[i].members+'</li>');   
                    $("#loadedbills").append('<li>Split Amount(per member): '+reqData[i].splitamount+'</li>');   
                    $("#loadedbills").append('<li>Paid by: '+reqData[i].payer+'</li>');   
                    $("#loadedbills").append('<li>Date: '+reqData[i].date+'</li>');   
                    $("#loadedbills").append('<li>Time :'+reqData[i].time+'</li>');   
                    $("#loadedbills").append('<li>Total Members: '+reqData[i].totalMember+'</li>');
                    counter++;
                    flag = false;
                }
                
            }
        }
        if(flag)
        {
            alert("You don't have any bills!");
        }
        $('#loadedbills').listview('refresh');
}

function cloudData()
{
    $("#heading").empty();
    if($('input[name=radio]:checked').val())
    {
        if($('input[type=radio][name=radio]:checked').attr('id') == "payer")
        {
            const url = IPAddress + "/loadbilldata/"+UserName;
            $.ajax({
                type: "GET",
                datatype: "json",
                url: url,
                success: function (data) {
                    $("#cloudbills").empty();
                    if (data.length != 0) 
                    {
                        var id;
                        $("#heading").append("Your friends owe you");
                        for(var i=0; i<data.length; i++)
                        {
                            id=data[i]._id;
                            $("#cloudbills").append('<li data-inline="true" data-role="list-divider"><h1>Bill '+(i+1)+'</h1></li>');
                            $("#cloudbills").append('<li>Bill Amount: '+data[i].billamount+'</li>');   
                            $("#cloudbills").append('<li>Bill Description: '+data[i].billdesc+'</li>');   
                            $("#cloudbills").append('<li>Members: '+data[i].members+'</li>');   
                            $("#cloudbills").append('<li>Split Amount(per member): '+data[i].splitamount+'</li>');   
                            $("#cloudbills").append('<li>Paid by: '+data[i].payer+'</li>');   
                            $("#cloudbills").append('<li>Date: '+data[i].date+'</li>');   
                            $("#cloudbills").append('<li>Time :'+data[i].time+'</li>');   
                            $("#cloudbills").append('<li>Total Members: '+data[i].totalMember+'</li>'); 
                            var deletefun = "deleteData('"+data[i]._id+"')";
                            $("#cloudbills").append('<li><button data-role="button" style="width: 50%; text-align:center; margin:auto;" onclick="'+deletefun+'" data-icon="minus">Settle</button></li>'); 
                            
                        } 
                       $.mobile.changePage("index.html#expensesCloud");
                       $("#cloudbills").listview("refresh");
                    }
                    else 
                    {
                        alert("You haven't paid any bills yet!");
                        $.mobile.changePage("index.html#expenses");
                    }
                },
                error: function (err) {
                    alert(JSON.stringify(err));
                }
            });
        }
        else
        {
            const url = IPAddress + "/loadbilldata";
            $.ajax({
                type: "GET",
                datatype: "json",
                url: url,
                success: function (data) {
                    $("#cloudbills").empty();
                    if (data) 
                    {
                        var counter = 1;
                        var flagCloud = true;
                        $("#heading").append("You owe your friends");
                        for(var i=0; i<data.length; i++)
                            {
                                var mem = data[i].members.split(", ");
                                for(var j=0; j<mem.length; j++)
                                {	
                                    if(mem[j] != UserName)
                                    {
                                        continue;
                                    }
                                    else
                                    {
                                        if(data[i].payer != UserName)
                                        {
                                            $("#cloudbills").append('<li data-role="list-divider"><h1>Bill '+counter+'</h1></li>');
                                            $("#cloudbills").append('<li>Bill Amount: '+data[i].billamount+'</li>');   
                                            $("#cloudbills").append('<li>Bill Description: '+data[i].billdesc+'</li>');   
                                            $("#cloudbills").append('<li>Members: '+data[i].members+'</li>');   
                                            $("#cloudbills").append('<li>Split Amount(per member): '+data[i].splitamount+'</li>');   
                                            $("#cloudbills").append('<li>Paid by: '+data[i].payer+'</li>');   
                                            $("#cloudbills").append('<li>Date: '+data[i].date+'</li>');   
                                            $("#cloudbills").append('<li>Time :'+data[i].time+'</li>');   
                                            $("#cloudbills").append('<li>Total Members: '+data[i].totalMember+'</li>'); 
                                            counter++;
                                            flagCloud = false;
                                        }
                                        
                                    }
                                }
                                
                            }
                            if(flagCloud)
                                {
                                    alert("You don't have any bills to pay!");
                                    $.mobile.changePage("index.html#expenses");
                                }
                       else {
                             $.mobile.changePage("index.html#expensesCloud");
                             $("#cloudbills").listview("refresh");
                       }
                    }
                    else 
                    {
                        alert("There is no bill for you!");
                        $.mobile.changePage("index.html#expenses");
                    }
                },
                error: function (err) {
                    alert(JSON.stringify(err));
                }
            });
        }
        
    }
    else
    {
        alert("Please select one option!");
    }
}

function deleteData(id)
{
    const url = IPAddress + "/deletebill/"+id;
    $.ajax({
        type: "POST",
        datatype: "json",
        url: url,
        success: function (data) {
            alert("Bill Deleted");
            $.mobile.changePage("index.html#bills");
        },
        error: function (err) {
            alert("Somthing went wrong! \nPlease try again");
        }
    }); 
}