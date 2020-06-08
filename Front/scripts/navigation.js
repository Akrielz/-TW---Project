function signOut(){
    localStorage.clear();
}

function redirect_on_start(){
    let user_id = localStorage.getItem("stol_owner_id");
    if(user_id){
        document.location.href = "/home";
    }
    else{
        document.location.href = "/prehome";
    }
}
