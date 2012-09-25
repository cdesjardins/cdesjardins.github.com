if (document.getElementById) 
{
  document.write('<style type="text/css">.hidden {display:none; border-left:white 20px solid; color:#404040; font: arial, helvetica, sans-serif; margin-bottom: 12px;}</style>') 
}

var sectionList = new Array("sec0", "sec1","sec2","sec3","sec4","sec5");
                                         
                                         
function texthide(sectionid) 
{
  for(var i = 0; i < sectionList.length; i++) 
  {
    if (sectionList[i] == sectionid) 
	{
      if (document.getElementById(sectionList[i]).style.display == "block") 
	  {
	    document.getElementById(sectionList[i]).style.display = "none" 
	  }
      else 
	  {
        document.getElementById(sectionList[i]).style.display = "block"
      }
    } 
    else 
    {
      document.getElementById(sectionList[i]).style.display = "none"; 
	}
  }
}
