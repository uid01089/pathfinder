
import { Component } from '../js_web_comp_lib/Component';

import { CSS } from '../Css';
import './LeafMapMain';



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

        <leaf-map-main></leaf-map-main>




 
 
    `;
  }
}

window.customElements.define('p3-electron-app', P3ElectronApp);
