function doo(){
    let owner_id = document.getElementsByName("owner_id")[0];

    owner_id.value = localStorage.getItem("stol_owner_id");
}
