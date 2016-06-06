function two() {

var a = ['1101001', '1101002', '1101003'];
var b = ['1102001', '1102002', '1102003'];
var c = ['1103001', '1103002', '1103003'];
var d = ['1104001','1104002','1104003'];
var e = ['1105001','1105002','1105003'];
var f = ['1106001','1106002','1106003'];
var g = ['1107001'];
var h = ['1108001','1108002'];
var x =['1109001','1109002'];
var items = [a, b, c,d,e,f,g,h,x] ;


function classesChange()
{
    if (xmlhttp.readyState==4)
        {
        if (xmlhttp.status==200)
            {
             var xmldoc=xmlhttp.responseXML;
             
            var content=document.getElementsByClassName('content');
            
            var students=xmldoc.getElementsByTagName('student');
            var tser='';
            var i=0;
           while(i<students.length){
            
                var tstr=tstr+'<tr>'+
                        '<td>'+students[i].getElementsByTagName('id')[0].childNodes[0].nodeValue+'</td>'+
                        '<td>'+students[i].getElementsByTagName('姓名')[0].childNodes[0].nodeValue+'</td>'+
                        '<td>'+students[i].getElementsByTagName('性别')[0].childNodes[0].nodeValue+'</td>'+
                        '<td>'+students[i].getElementsByTagName('班级')[0].childNodes[0].nodeValue+'</td>'+
                        '<td>'+students[i].getElementsByTagName('专业')[0].childNodes[0].nodeValue+'</td>'+
                    '</tr>'
                    
                    i=i+1;
           }

           tstr='<table><thead><tr><th>学号</th><th>姓名</th><th>性别</th><th>班级</th><th>专业</th></tr></thead><tbody>'+tstr+'</tbody></table>';

           console.log(tstr[0]);
           content[0].innerHTML=tstr
           content[0].removeChild(content[0].childNodes[0])


            }
        else
            {
                alert("Problem retrieving XML data");
            }
        }
}

var xmlhttp;
function loadXMLDoc(url)
{
        xmlhttp=null;
        if (window.XMLHttpRequest)
        {// code for all new browsers
            xmlhttp=new XMLHttpRequest();
        }
        else if (window.ActiveXObject)
        {// code for IE5 and IE6
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (xmlhttp!=null)
        {
            
            xmlhttp.onreadystatechange = classesChange;
            xmlhttp.open("GET",url,true);
            xmlhttp.send(null);

        }
        else
        {
            alert("Your browser does not support XMLHTTP.");
        }
}








var first = document.getElementById('collage');

var second = document.getElementById('class');

var submit = document.getElementById('submit');

setValue(second, a);

first.addEventListener('change', function(event){
       setValue(second, items[this.selectedIndex]);
       var collageid = event.target.value
       loadXMLDoc('http://localhost:3000/data?collage='+collageid)

});

second.addEventListener('change', function(event){
       
       var classesid = event.target.value;
       loadXMLDoc('http://localhost:3000/data?classes='+classesid);

});


submit.addEventListener('click', function(event){
       var id = document.getElementById('id').value;
       event.preventDefault();
       
       loadXMLDoc('http://localhost:3000/data?id='+id);

});




function setValue(e,v){
    e.options.length = 0;
    for(i in v){
        var o = document.createElement('option');
        o.text = v[i];
        e.appendChild(o);
    }
}

}
window.onload= two


