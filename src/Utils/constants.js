"use strict";

class Constants{
	static getConstants(){
			return {
				errorMessage: "¡Vaya!, parece que algo ha salido mal y no he podido encontrar respuesta a lo que buscabas. ¿Sobre qué enfermedad, prueba médica, o tratamiento quieres información?",
				goodByeErrorMessage: "Gracias por contar con Medikfy para tus consultas médicas. ¡Espero oírte pronto de nuevo!",
				tokenUnhandledResponse:'Todavía no está disponible la elección por pantalla en este apartado. Prueba a decirme Alexa, y la opción que deseas', 
				typeEnfermedad: "Enfermedad",
				typePrueba: "Prueba OR Tratamiento",
				typeWildCard: "Prueba OR Tratamiento OR Enfermedad",
				welcomeModalTitle:'Bienvenido a Medikfy ¿Qué quieres hacer?',
				exitModalTitle:"Gracias por tu visita",
				exitModalBody:"Esperamos volver a verte pronto",
				helpModalTitle:'¿Sobre qué necesitas ayuda?',
				masinfoTitle:'¡Hola! ¿Qué te gustaría hacer?',
				futureIntentsText:'<br/><font size="7">Próximamente ...</font>',
				errorIntentsText:'<br/><font size="7">Lo siente me he distraido un momento ...</font>',
				darkSuffix:'_oscura.'
			}
		}
}

module.exports=Constants;