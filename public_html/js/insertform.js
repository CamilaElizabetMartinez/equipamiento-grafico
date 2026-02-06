$(document).ready(function () {
    InicializarImagen();
});

function InicializarImagen() {
    EventosImagen();
}

function EventosImagen() {
    $('#btnAdd').on("click", function (e) {
        //e.preventDefault();
        $('.inputFiles').append(
            `   <div class="m-3">
                <input type="file" class="form-control" name="fichero[]" aria-describedby="fichero" placeholder="Fichero">
                <button class="btn btn-danger" type="delete" onclick="QuitarUpload(this);">Quitar</button>
            </div>
        `);
    });
}
function QuitarUpload(obj) {
    $(obj).parent('div').remove();
}
