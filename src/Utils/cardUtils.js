"use strict";
//Alexa
const Alexa = require('ask-sdk');

class cardUtils{
			static imageMaker(pDesc, pSource) {
				const myImage = new Alexa.ImageHelper()
					.withDescription(pDesc)
					.addImageInstance(pSource)
					.getImage();

				return myImage;
			}

			static richTextMaker(pPrimaryText, pSecondaryText, pTertiaryText) {
				const myTextContent = new Alexa.RichTextContentHelper();

				if (pPrimaryText)
					myTextContent.withPrimaryText(pPrimaryText);

				if (pSecondaryText)
					myTextContent.withSecondaryText(pSecondaryText);

				if (pTertiaryText)
					myTextContent.withTertiaryText(pTertiaryText);

				return myTextContent.getTextContent();
			}

			static plainTextMaker(pPrimaryText, pSecondaryText, pTertiaryText) {
				const myTextContent = new Alexa.PlainTextContentHelper()
					.withPrimaryText(pPrimaryText)
					.withSecondaryText(pSecondaryText)
					.withTertiaryText(pTertiaryText)
					.getTextContent();

				return myTextContent;
			}

	
}

module.exports=cardUtils;