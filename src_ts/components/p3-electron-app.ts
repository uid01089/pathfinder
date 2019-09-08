

import { Component } from '../lib/Component';
import { CSS } from '../Css';
import './MapMain';



class P3ElectronApp extends Component {


  constructor() {
    super();


  }

  connectedCallback() {
    console.log('P3ElectronApp added to page.');

  }

  getHTML() {

    return Component.html` 
        ${CSS}
        
        <style>

        </style>

        <map-main></map-main>




 
 
    `;
  }
}

window.customElements.define('p3-electron-app', P3ElectronApp);
