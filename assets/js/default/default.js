$(function(){
    $("#qrcode").hide();
    $("#social").hover(function(){
        $("#qrcode").show();
    }, function(){
        $("#qrcode").hide();
    });

    var status_desc = {
        1: "任务生成",
        2: "进行中",
        3: "完成了",
        4: "延误",
        5: "已暂停"
    };

    $.get(
        "http://157.7.109.186:8090/api/v1/task", function(data) {
            if (data) {
                if (data.meta.status == 1){
                    $("#daily_task #title").html(data.data.task.title);
                    $("#daily_task #content").html("描述：" + data.data.task.content);
                    $("#daily_task #status").html(status_desc[data.data.task.status]);
                    $("#daily_task #duration").html("历时：" + data.data.task.duration + "小时");
                } else {
                    $("#daily_task").html("");
                }
            }
        }
    );
});
