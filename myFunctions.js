if (typeof jQuery !== "undefined" && !jQuery.trim) {
    jQuery.trim = function (v) {
        return v == null ? "" : String(v).trim();
    };
}
if (typeof $ !== "undefined" && !$.trim) {
    $.trim = function (v) {
        return v == null ? "" : String(v).trim();
    };
}

$(document).ready(function () {
    $("#wrapper").hide().fadeIn(600);
    $("#nav a").hover(
        function () { $(this).fadeTo(150, 0.6); },
        function () { $(this).fadeTo(150, 1); }
    );

    if ($("#carsTable").length > 0) {
        initCars();
    }
});

function initCars() {
    $("#bookingForm").attr("novalidate", "novalidate");

    $(".showDetails").on("change click", function () {
        var carId = $(this).val();
        var detailsRow = $("#details-" + carId);
        if (this.checked) {
            detailsRow.addClass("show");
        } else {
            detailsRow.removeClass("show");
        }
    });

    $("#continueBtn").on("click", function () {
        if ($(".pick:checked").length === 0) {
            alert("الرجاء اختيار سيارة واحدة على الأقل قبل المتابعة.");
            return;
        }
        $("#bookingForm").slideDown(400);
        $("html, body").animate({ scrollTop: $("#bookingForm").offset().top }, 500);
    });

    $("#closeFormBtn").on("click", function () {
        if (confirm("هل أنت متأكد من إغلاق عملية متابعة الشراء؟")) {
            $("#bookingForm").slideUp(400);
            $(".pick").prop("checked", false);
            $(".showDetails").prop("checked", false);
            $(".details").removeClass("show");
            $("#bookingForm")[0].reset();
            $(".error").text("");
            $("html, body").animate({ scrollTop: $("#carsTable").offset().top }, 500);
        }
    });

    $("#bookingForm").on("submit", function (e) {
        e.preventDefault();
        if (validateForm()) {
            showResult();
        }
    });

    $("#closeResult").on("click", function () {
        $("#resultOverlay").fadeOut(300, function () {
            $(this).addClass("hidden");
        });
    });

    $("#resultOverlay").on("click", function (e) {
        if ($(e.target).is("#resultOverlay")) {
            $(this).fadeOut(300, function () {
                $(this).addClass("hidden");
            });
        }
    });
}

function cleanVal(selector) {
    var elem = $(selector);
    if (!elem.length) return "";
    var v = elem.val();
    return v == null ? "" : String(v).trim();
}

function checkName(v) {
    if (v === "") return "";
    // Arabic letters and single/multiple spaces between words
    if (!/^[\u0621-\u064A]+(?:\s+[\u0621-\u064A]+)*$/.test(v)) {
        return "الاسم يجب أن يحتوي على أحرف هجائية عربية فقط.";
    }
    return "";
}

function checkNationalId(v) {
    if (v === "") {
        return "الرقم الوطني إلزامي الإدخال.";
    }
    if (!/^\d{11}$/.test(v)) {
        return "الرقم الوطني يجب أن يتكون من 11 رقماً.";
    }
    var gov = parseInt(v.substring(0, 2), 10);
    if (gov < 1 || gov > 14) {
        return "أول خانتين ترمزان إلى المحافظة ويجب أن تكونا بين 01 و 14.";
    }
    return "";
}

function parseDate(v) {
    if (!v) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return null;
    var y = parseInt(m[1], 10), mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
        return null;
    }
    return dt;
}

function checkMobile(v) {
    if (v === "") return "";
    if (!/^(?:\+963|00963|0)?9[3-689]\d{7}$/.test(v)) {
        return "رقم الموبايل يجب أن يطابق شبكتي Syriatel أو MTN (مثال: 0933123456 أو 0944123456).";
    }
    return "";
}

function checkEmail(v) {
    if (v === "") return "";
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v)) {
        return "صيغة البريد الإلكتروني غير صحيحة (مثال: name@domain.com).";
    }
    return "";
}

function validateForm() {
    var ok = true;
    var name = cleanVal("#fullName");
    var nid = cleanVal("#nationalId");
    var s = cleanVal("#startDate");
    var e = cleanVal("#endDate");
    var mobile = cleanVal("#mobile");
    var email = cleanVal("#email");

    var errs = {
        "#err-name": checkName(name),
        "#err-nid": checkNationalId(nid),
        "#err-start": "",
        "#err-end": "",
        "#err-mobile": checkMobile(mobile),
        "#err-email": checkEmail(email)
    };

    var sd = null, ed = null;

    if (s === "") {
        errs["#err-start"] = "تاريخ بداية التأجير إلزامي الإدخال.";
    } else {
        sd = parseDate(s);
        if (sd === null) {
            errs["#err-start"] = "صيغة تاريخ البداية yyyy-mm-dd غير صحيحة.";
        }
    }

    if (e === "") {
        errs["#err-end"] = "تاريخ نهاية التأجير إلزامي الإدخال.";
    } else {
        ed = parseDate(e);
        if (ed === null) {
            errs["#err-end"] = "صيغة تاريخ النهاية yyyy-mm-dd غير صحيحة.";
        }
    }

    if (sd !== null && ed !== null && ed <= sd) {
        errs["#err-end"] = "تاريخ نهاية التأجير يجب أن يكون لاحقاً لتاريخ البداية.";
    }

    var firstErrorElem = null;
    for (var id in errs) {
        var msg = errs[id];
        $(id).text(msg);
        if (msg !== "") {
            ok = false;
            if (!firstErrorElem) {
                var inputId = id.replace("#err-", "");
                if (inputId === "name") inputId = "fullName";
                else if (inputId === "nid") inputId = "nationalId";
                else if (inputId === "start") inputId = "startDate";
                else if (inputId === "end") inputId = "endDate";
                firstErrorElem = $("#" + inputId);
            }
        }
    }

    if (!ok && firstErrorElem && firstErrorElem.length) {
        firstErrorElem.focus();
    }

    return ok;
}

function showResult() {
    var sd = parseDate(cleanVal("#startDate"));
    var ed = parseDate(cleanVal("#endDate"));
    if (!sd || !ed) return;

    var days = Math.round((ed - sd) / (1000 * 60 * 60 * 24));
    var total = 0;

    var html = "<table style=\"width:100%; border-collapse:collapse; margin:15px 0;\">";
    html += "<thead><tr><th style=\"padding:12px;\">السيارة</th><th style=\"padding:12px;\">السعر اليومي</th><th style=\"padding:12px;\">عدد الأيام</th><th style=\"padding:12px;\">المبلغ</th></tr></thead><tbody>";

    $(".pick:checked").each(function () {
        var row = $("#row-" + $(this).val());
        var model = row.find(".model").text().trim();
        var rawPrice = row.find(".price").text();
        var price = parseInt(rawPrice.replace(/[^\d]/g, ""), 10) || 0;
        var cost = price * days;
        total += cost;

        html += "<tr>";
        html += "<td style=\"padding:10px;\">" + model + "</td>";
        html += "<td style=\"padding:10px;\">" + price.toLocaleString("en-US") + " ل.س</td>";
        html += "<td style=\"padding:10px;\">" + days + " يوم</td>";
        html += "<td style=\"padding:10px;\">" + cost.toLocaleString("en-US") + " ل.س</td>";
        html += "</tr>";
    });

    var discount = 0;
    if (days > 10) {
        discount = Math.round(total * 0.05);
    }
    var finalAmount = total - discount;

    html += "</tbody><tfoot>";
    html += "<tr class=\"total\"><td colspan=\"3\" style=\"padding:10px; font-weight:bold;\">المجموع الإجمالي</td><td style=\"padding:10px; font-weight:bold;\">" + total.toLocaleString("en-US") + " ل.س</td></tr>";

    if (days > 10) {
        html += "<tr class=\"total\" style=\"background:#e8f8f5; color:#1b7a4b;\"><td colspan=\"3\" style=\"padding:10px; font-weight:bold;\">الخصم (5% لتجاوز مدة التأجير 10 أيام)</td><td style=\"padding:10px; font-weight:bold;\">- " + discount.toLocaleString("en-US") + " ل.س</td></tr>";
    } else {
        html += "<tr class=\"total\"><td colspan=\"3\" style=\"padding:10px;\">الخصم (يطبق فقط في حال تجاوزت المدة 10 أيام)</td><td style=\"padding:10px;\">0 ل.س</td></tr>";
    }

    html += "<tr class=\"total\" style=\"background:#d4edda; color:#155724; font-size:18px;\"><td colspan=\"3\" style=\"padding:12px; font-weight:bold;\">المبلغ الإجمالي النهائي</td><td style=\"padding:12px; font-weight:bold;\">" + finalAmount.toLocaleString("en-US") + " ل.س</td></tr>";
    html += "</tfoot></table>";

    var name = cleanVal("#fullName");
    var applicantHtml = "";
    if (name !== "") {
        applicantHtml = "<p style=\"font-size:16px; margin-bottom:8px; color:#1f4e79;\"><strong>اسم مقدم الطلب:</strong> " + name + "</p>";
    }
    var periodHtml = "<p style=\"font-size:15px; margin-bottom:12px; color:#555;\"><strong>فترة التأجير:</strong> من " + cleanVal("#startDate") + " إلى " + cleanVal("#endDate") + " (" + days + " يوم)</p>";

    $("#resultContent").html(applicantHtml + periodHtml + html);
    $("#resultOverlay").removeClass("hidden").hide().fadeIn(300);
}