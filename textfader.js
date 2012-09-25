/*******************************************************************
*
* File    : textfader.js
*
* Created : 2001/01/19
*
* Author  : Roy Whittle  (Roy@Whittle.com) www.Roy.Whittle.com
*
* Purpose : To create fading text link descriptions
*
* History
* Date         Version        Description
*
* 2001-01-19	2.0		Combined 3 previous versions.
***********************************************************************/
/*** Create some global variables (use GNG_ to avoid conflicts )***/
var GNG_FadingObject = new Array();
var GNG_FadeRunning  = false;
var GNG_FadeInterval = 30;

/*******************************************************************************/
/*** These are the simplest HEX/DEC conversion routines I could come up with ***/
/*** I have seen a lot of fade routines that seem to make this a             ***/
/*** very complex task. I am sure somene else must've had this idea          ***/
/*******************************************************************************/
var hexDigit=new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");
function dec2hex(dec)
{
	return(hexDigit[dec>>4]+hexDigit[dec&15]);
}
function hex2dec(hex)
{
	return(parseInt(hex,16))
}
/******************************************************************************************/

/***********************************************************
* Function   : createFaderObject
*
* Parameters : theDiv   - The name of the DIV in which to fade the text
*              numSteps - The number of steps to use in the fade.
*		       startColor - The background colour of the page.
*              
* Description : Creates an object that can hold the current
*               state of the fade animation for a particular DIV
***********************************************************/
function GNG_createFaderObject(theDiv, numSteps, startColor, defaultText, defaultColor)
{
	if(!startColor)
		startColor = "FF0000";
	if(!defaultColor)
		defaultColor = "00FFFF";
		
	this.name		= theDiv;
	this.text		= null;
	this.color		= "FFFFFF";
	this.next_text	= null;
	this.next_color	= null;
	this.state		= "OFF";
	this.index		= 0;
	this.steps		= numSteps;
	this.defaultText	= defaultText;
	this.defaultColor	= defaultColor;
	this.r		= hex2dec(startColor.slice(0,2));
	this.g		= hex2dec(startColor.slice(2,4));
	this.b		= hex2dec(startColor.slice(4,6));
	
	if(defaultText)
	{
		this.index		= numSteps;
		this.state		= "ON";
		this.text		= defaultText;
		this.color		= defaultColor;
	}
}

/***********************************************************
* Function   : textfader
*
* Parameters : theDiv   - The name of the DIV in which to fade the text
*              numSteps - The number of steps to use in the fade.
*              
* Description : Library function to be called from the main HTML.
*		        Creates an object that can hold the current
*               state of the fade animation for a particular DIV
***********************************************************/
function TextFader(theDiv, numSteps, startColor, defaultText, defaultColor)
{
	GNG_FadingObject[theDiv] = new GNG_createFaderObject(theDiv, numSteps, startColor, defaultText, defaultColor);
	var str = "&nbsp;";

	if(defaultText != null)
		str = "<FONT COLOR="+ defaultColor + ">" + defaultText + "</FONT>";

	if(document.layers)
		return('<ILAYER WIDTH="100%"><LAYER name="'+theDiv+'">'+str+'</ILAYER></LAYER>');
	else
		return('<div id="'+theDiv+'">'+str+'</div>');
}
/*****************************************************************
* Function    : start_fading
*
* Description : If the FadeAnimation loop is not currently running
*		        then it is started.
*****************************************************************/
function GNG_start_fading()
{
	if(!GNG_FadeRunning)
		GNG_FadeAnimation();
}
/*****************************************************************
* Function    : GNG_setText
*
* Description : In the new W3C DOM model we need only set the text
*			once, after that we can just change the colour
*****************************************************************/
function GNG_setText(f)
{
	if(navigator.appName.indexOf("Netscape") != -1
		&& document.getElementById)
	{
		var theElement = document.getElementById(f.name);
		var newRange   = document.createRange();
		newRange.setStartBefore(theElement);
		var strFrag    = newRange.createContextualFragment(f.text);	

		while (theElement.hasChildNodes())
			theElement.removeChild(theElement.lastChild);
		theElement.appendChild(strFrag);
		theElement.style.color="#"+f.startColor;
	}
}
/*****************************************************************
*
* Function   : getColor
*
* Parameters : f - the fade object for which to calculate the colour.
*
* Description: Calculates the color of the link depending on
*		       how far through the fade we are.
*
*****************************************************************/
function getColor(f)
{
	var r=hex2dec(f.color.slice(0,2));
	var g=hex2dec(f.color.slice(2,4));
	var b=hex2dec(f.color.slice(4,6));

	r2= Math.floor(f.r+(f.index*(r-f.r))/(f.steps) + .5);
	g2= Math.floor(f.g+(f.index*(g-f.g))/(f.steps) + .5);
	b2= Math.floor(f.b+(f.index*(b-f.b))/(f.steps) + .5);

	return("#" + dec2hex(r2) + dec2hex(g2) + dec2hex(b2));
}
function getLayer(n, d) 
{
	var lyr = d.layers[n];
	if(!lyr && d.layers)  
		for(var i=0 ; !lyr && i<d.layers.length ; i++) 
			lyr=getLayer(n,d.layers[i].document); 
	return lyr;
}


/*****************************************************************
*
* Function   : setColor
*
* Parameters : fadeObj   - The TextFader object to set
*
* Description: Gets the color of the text and writes it to
*		       the DIV.
*
*****************************************************************/
function setColor(fadeObj)
{
	var theColor=getColor(fadeObj);
	var str="<FONT COLOR="+ theColor + ">" + fadeObj.text + "</FONT>";
	var theDiv=fadeObj.name;
	
//if IE 4+
//	if(document.all)
//	{
//		document.all[theDiv].innerHTML=str;
//	}	
//else if NS 4
	if(document.layers)
	{
		if(!fadeObj.layer)
			fadeObj.layer = getLayer(theDiv, document);
		fadeObj.layer.document.write(str);
		fadeObj.layer.document.close();
	}
//else if NS 6 (supports new DOM, may work in IE5) - see Website Abstraction for more info.
//http://www.wsabstract.com/javatutors/dynamiccontent4.shtml
	else if (document.getElementById)
	{
		theElement = document.getElementById(theDiv);
		theElement.style.color=theColor;
	}
	
}
function fade_up(theDiv, newText, newColor)
{
	var f = GNG_FadingObject[theDiv];

	if(f.defaultText == null)
	{
		fade_up2(theDiv, newText, newColor);
	}
	else
	{
		fade_down2(theDiv);
		fade_up2(theDiv, newText, newColor);
	}
}
/*****************************************************************
*
* Function   : fade_up
*
* Parameters : theDiv  - The div in which to display the text
*		       newText - The text to display when faded in
*		       newColor- The color the text will be.
*
* Description: Depending on the current "state" of the fade
*		       this function will determine the new state and
*		       if neccessary, start the fade effect.            
*
*****************************************************************/
function fade_up2(theDiv, newText, newColor)
{
	var f=GNG_FadingObject[theDiv];

	if(newColor == null)
		newColor="FFFFFF";

	if(f.state == "OFF")
	{
		f.text  = newText;
		f.color = newColor;
		f.state = "FADE_UP";
		GNG_setText(f);
		GNG_start_fading();
	}
	else if( f.state == "FADE_UP_DOWN"
		|| f.state == "FADE_DOWN"
		|| f.state == "FADE_DOWN_UP")
	{
		if(newText == f.text)
			f.state = "FADE_UP";
		else
		{
			f.next_text  = newText;
			f.next_color = newColor;
			f.state      = "FADE_DOWN_UP";
		}
	}
}
function fade_down(theDiv)
{
	var f=GNG_FadingObject[theDiv];

	if(f.defaultText == null)
		fade_down2(theDiv);
	else
	{
		fade_down2(theDiv);
		fade_up2(theDiv, f.defaultText, f.defaultColor);
	}
}
/*****************************************************************
*
* Function   : fade_down
*
* Parameters : theDiv  - The div in which to display the text
*
* Description: Depending on the current "state" of the fade
*		       this function will determine the new state and
*		       if neccessary, start the fade effect.            
*
*****************************************************************/
function fade_down2(theDiv)
{
	var f=GNG_FadingObject[theDiv];

	if(f.state=="ON")
	{
		f.state="FADE_DOWN";
		GNG_start_fading();
	}
	else if(f.state=="FADE_DOWN_UP")
	{
		f.state="FADE_DOWN";
		f.next_text = null;
	}
	else if(f.state == "FADE_UP")
	{
		f.state="FADE_UP_DOWN";
	}
}
/*******************************************************************
*
* Function    : Animate
*
* Description : This function is based on the Animate function
*		        of animate2.js (animated rollovers).
*		        Each fade object has a state. This function
*		        modifies each object and changes its state.
*****************************************************************/
function GNG_FadeAnimation()
{
	GNG_FadeRunning = false;
	for (var d in GNG_FadingObject)
	{
		var f=GNG_FadingObject[d];

		if(f.state == "FADE_UP")
		{
			if(f.index < f.steps)
				f.index++;
			else
				f.index = f.steps;
			setColor(f);

			if(f.index == f.steps)
				f.state="ON";
			else
				GNG_FadeRunning = true;
		}
		else if(f.state == "FADE_UP_DOWN")
		{
			if(f.index < f.steps)
				f.index++;
			else
				f.index = f.steps;
			setColor(f);

			if(f.index == f.steps)
				f.state="FADE_DOWN";
			GNG_FadeRunning = true;
		}
		else if(f.state == "FADE_DOWN")
		{
			if(f.index > 0)
				f.index--;
			else
				f.index = 0;
			setColor(f);

			if(f.index == 0)
				f.state="OFF";
			else
				GNG_FadeRunning = true;
		}
		else if(f.state == "FADE_DOWN_UP")
		{
			if(f.index > 0)
				f.index--;
			else
				f.index = 0;
			setColor(f);

			if(f.index == 0)
			{
				f.text      = f.next_text;
				f.color     = f.next_color;
				f.next_text = null;
				f.state     ="FADE_UP";
				GNG_setText(f);
			}
			GNG_FadeRunning = true;
		}
	}
	/*** Check to see if we need to animate any more frames. ***/
	if(GNG_FadeRunning)
		setTimeout("GNG_FadeAnimation()", GNG_FadeInterval);

}
