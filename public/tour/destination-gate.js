/* A destination reached by gaze must be left before another gaze activation. */
(function(root){
  function createDestinationGate(){
    let locked=false;
    return {
      get locked(){return locked;},
      activate({inVR,isGaze}){
        if(inVR&&isGaze&&locked)return false;
        if(inVR)locked=true;
        return true;
      },
      observe({ready,intersects}){
        if(locked&&ready&&!intersects){locked=false;return true;}
        return false;
      },
      reset(){locked=false;}
    };
  }
  if(typeof module!=='undefined'&&module.exports)module.exports=createDestinationGate;
  else root.createLensDestinationGate=createDestinationGate;
})(typeof window==='undefined'?globalThis:window);
