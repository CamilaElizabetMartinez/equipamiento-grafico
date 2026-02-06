$(document).ready(function () {
    inicializaEventos();
});

function inicializaEventos (){
    $('#formSearch').submit(function () {
        getInputPutAction();
    });
};

function getInputPutAction(){
   var valueInput =  $('#inputForm').val();
   var formAction = $('#formSearch').attr('action');
   var newAction = formAction + "/" + valueInput;
   $('#formSearch').attr('action',newAction);
};