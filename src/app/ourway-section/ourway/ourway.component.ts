import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';
import { StateManagerService } from '../../state-manager.service';

@Component({
  selector: 'app-ourway',
  standalone: true,
  imports: [],
  templateUrl: './ourway.component.html',
  styleUrl: './ourway.component.scss',
})
export class OurwayComponent implements OnInit {
  // Scene Setup
  @ViewChild('container', { static: true }) container!: ElementRef;
  @ViewChild('mainCanvas', { static: true }) canvas!: ElementRef;
  @ViewChild('label', { static: true }) labelElem!: ElementRef;
  @ViewChild('label2', { static: true }) labelElem2!: ElementRef;
  @ViewChild('label3', { static: true }) labelElem3!: ElementRef;
  @ViewChild('label4', { static: true }) labelElem4!: ElementRef;
  @ViewChild('label5', { static: true }) labelElem5!: ElementRef;
  @ViewChild('next', { static: true }) buttonNext!: ElementRef;
  @ViewChild('prev', { static: true }) buttonPrev!: ElementRef;
  @ViewChild('reset', { static: true }) buttonReset!: ElementRef;
  @ViewChild('labelContainer', { static: true }) labelContainer!: ElementRef;

  @ViewChild('loadingBar', { static: true }) loadingElem!: ElementRef;
  @ViewChild('loadingFill', { static: true }) fillElem!: ElementRef;
  @ViewChild('loadingLabel', { static: true }) loadLabelElem!: ElementRef;

  isMediumScreen = false;

  scene = new THREE.Scene();
  loadScene = new THREE.Scene();
  mainScene = new THREE.Scene();

  singleButtonPos = { x: -1.58, y: -4, z: 0 };
  duoButtonPos = [
    { x: -3.2, y: -4, z: 0 },
    { x: 0, y: -4, z: 0 },
  ];

  cameraView = 45;
  containerWidth!: number;
  containerHeight = 480;
  aspect!: number;
  camera!: THREE.OrthographicCamera;
  animFix = true;
  renderer!: THREE.WebGLRenderer;

  planets: any[] = [];
  availablePlanets: any[] = [];
  unlockedPlanets = 1;

  tweenGroup = new TWEEN.Group();
  intersectsMoon: any[] = [];
  ringColor = { h: 0, s: 0, l: 0 };

  // Nebula Loader

  nebulaLoader = new THREE.TextureLoader();

  // GUI

  loadingObj!: CSS2DObject;

  labelObj!: CSS2DObject;
  labelObj2!: CSS2DObject;
  labelObj3!: CSS2DObject;
  labelObj4!: CSS2DObject;
  labelObj5!: CSS2DObject;

  resetObj!: CSS2DObject;
  prevObj!: CSS2DObject;
  nextObj!: CSS2DObject;

  labelRenderer = new CSS2DRenderer();

  // External model Loaders

  isLoaded = false;
  manager = new THREE.LoadingManager();
  loader = new GLTFLoader(this.manager);
  earthObj = new THREE.Object3D();
  planet1Obj = new THREE.Object3D();
  planet2Obj = new THREE.Object3D();
  planet3Obj = new THREE.Object3D();
  selectedPlanet = new THREE.Object3D();

  // Rings

  ringGeo = new THREE.RingGeometry(4.8, 5.1, 4);
  ringMat = new THREE.MeshBasicMaterial({ color: 0x7232c6 });
  ringMat2 = new THREE.MeshBasicMaterial({ color: 0x777777 });
  ringMesh = new THREE.Mesh(this.ringGeo, this.ringMat);

  hoveredFirstPlanet = false;
  expand = true;
  finalAnimation = false;
  ringPoints = [0, 1.57, 3.14, 4.71, 6.28];

  offset = true;

  // Nebulas

  nebula = this.getNebula({
    hue: 0.6,
    numSprites: 10,
    opacity: 0.005,
    radius: 40,
    size: 500,
    z: -50.5,
    x: 50,
  });
  anotherNebula = this.getNebula({
    hue: 0.0,
    numSprites: 10,
    opacity: 0.005,
    radius: 40,
    size: 500,
    z: -50.5,
    x: -50,
  });

  // Raycasting
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  constructor(private stateManager: StateManagerService) {
    this.isMediumScreen = stateManager.getMediumScreen();
    if (this.isMediumScreen) {
      this.cameraView = 60;

      this.singleButtonPos = { x: -2.1, y: -5, z: 0 };
      this.duoButtonPos = [
        { x: -2.1, y: -4, z: 0 },
        { x: -2.1, y: -5.5, z: 0 },
      ];
    }
  }

  onPointerMove(event: any) {
    // Get the bounding rectangle of the canvas
    const rect = this.renderer.domElement.getBoundingClientRect();

    // Adjust the pointer coordinates based on the canvas offset and size
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.intersectsMoon = this.raycaster.intersectObjects(this.planets, true);
  }

  // Lighting
  pointLight = new THREE.PointLight(0xffffff, 100, 1000, 1);
  ambientLight = new THREE.AmbientLight(0xcccccc);

  // Post processing
  renderScene!: RenderPass;
  composer!: EffectComposer;
  bloomPass!: UnrealBloomPass;

  // Moon model
  moonMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
  moon!: THREE.Mesh;

  // Pathing
  lineMat = new THREE.LineDashedMaterial({
    color: 0x8343d7,
    dashSize: 1,
    gapSize: 1,
  });

  lineMat2 = new THREE.LineDashedMaterial({
    color: 0x666666,
    dashSize: 1,
    gapSize: 1,
  });
  points: THREE.Vector3[] = [];

  lineGeo1!: THREE.BufferGeometry;
  line1!: THREE.Line;
  lineGeo2!: THREE.BufferGeometry;
  line2!: THREE.Line;
  lineGeo3!: THREE.BufferGeometry;
  line3!: THREE.Line;
  lineGeo4!: THREE.BufferGeometry;
  line4!: THREE.Line;

  ngOnInit(): void {
    const containerStyles = getComputedStyle(this.container.nativeElement);
    this.containerWidth =
      this.container.nativeElement.clientWidth -
      parseFloat(containerStyles.paddingLeft) -
      parseFloat(containerStyles.paddingRight);
    this.containerHeight = this.container.nativeElement.clientHeight || 480;
    window.addEventListener('resize', () => this.onResize());
    this.aspect = (this.containerWidth / 880) * 1.75;
    this.camera = new THREE.OrthographicCamera(
      (this.aspect * this.cameraView) / -2,
      (this.aspect * this.cameraView) / 2,
      this.cameraView / 2,
      this.cameraView / -2,
      0.1,
      1000,
    );
    this.renderScene = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.containerWidth, this.containerHeight),
      1.6,
      0.1,
      0.1,
    );

    this.initRenderer();
    this.initGUI();
    this.initPathing();
    this.initExternal();
    this.initPostProcessing();

    // Nebulas

    this.scene.add(this.nebula);
    this.scene.add(this.anotherNebula);

    // Lighting

    this.pointLight.position.set(60, 20, 3);
    this.scene.add(this.pointLight, this.ambientLight);

    // Scene additional setup
    this.camera.position.setZ(30);

    this.animate();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas.nativeElement,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    //this.renderer.setSize(window.innerWidth, 400);
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
  }

  initGUI() {
    this.ringMesh.position.x = -40;
    this.ringMesh.position.y = -8;
    this.ringMesh.position.z = 0;

    this.scene.add(this.ringMesh);

    this.loadingObj = new CSS2DObject(this.loadingElem.nativeElement);
    this.loadScene.add(this.loadingObj);

    this.mainScene = this.loadScene;

    this.labelObj = new CSS2DObject(this.labelElem.nativeElement);
    this.labelObj.position.set(5, 10, 0);
    this.labelObj.center.set(0, 0);
    this.labelObj.layers.set(0);
    this.scene.add(this.labelObj);

    this.labelObj2 = new CSS2DObject(this.labelElem2.nativeElement);
    this.labelObj2.position.set(0, 0, 0);
    this.labelObj2.center.set(0, 0);
    this.labelObj2.layers.set(0);
    this.scene.add(this.labelObj2);

    this.labelObj3 = new CSS2DObject(this.labelElem3.nativeElement);
    this.labelObj3.position.set(0, 0, 0);
    this.labelObj3.center.set(0, 0);
    this.labelObj3.layers.set(0);
    this.scene.add(this.labelObj3);

    this.labelObj4 = new CSS2DObject(this.labelElem4.nativeElement);
    this.labelObj4.position.set(0, 0, 0);
    this.labelObj4.center.set(0, 0);
    this.labelObj4.layers.set(0);
    this.scene.add(this.labelObj4);

    this.labelObj5 = new CSS2DObject(this.labelElem5.nativeElement);
    this.labelObj5.position.set(0, 0, 0);
    this.labelObj5.center.set(0, 0);
    this.labelObj5.layers.set(0);
    this.scene.add(this.labelObj5);

    this.resetObj = new CSS2DObject(this.buttonReset.nativeElement);
    this.resetObj.position.set(20, 15, 0);
    this.resetObj.center.set(0, 0);
    this.resetObj.layers.set(0);
    this.scene.add(this.resetObj);

    this.prevObj = new CSS2DObject(this.buttonPrev.nativeElement);
    this.prevObj.position.set(22, 15, 0);
    this.prevObj.center.set(0, 0);
    this.prevObj.layers.set(0);
    this.scene.add(this.prevObj);

    this.nextObj = new CSS2DObject(this.buttonNext.nativeElement);
    this.nextObj.position.set(22, 15, 0);
    this.nextObj.center.set(0, 0);
    this.nextObj.layers.set(0);
    this.scene.add(this.nextObj);

    this.labelRenderer.setSize(this.containerWidth, this.containerHeight);
    this.labelRenderer.domElement.style.position = 'absolute';

    // Position the labelRenderer to align with the canvas
    this.labelRenderer.domElement.style.top = `0px`;
    this.labelRenderer.domElement.style.left = `6px`;

    // Append CSS2DRenderer to the Angular container
    this.labelContainer.nativeElement.appendChild(
      this.labelRenderer.domElement,
    );
  }

  initPathing() {
    this.points.push(new THREE.Vector3(-40, -8, 0));
    this.points.push(new THREE.Vector3(-20, 8, 0));

    this.lineGeo1 = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line1 = new THREE.Line(this.lineGeo1, this.lineMat2);
    this.line1.computeLineDistances();
    this.scene.add(this.line1);

    this.points.shift();
    this.points.push(new THREE.Vector3(0, -6, 0));
    this.lineGeo2 = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line2 = new THREE.Line(this.lineGeo2, this.lineMat2);
    this.line2.computeLineDistances();
    this.scene.add(this.line2);

    this.points.shift();
    this.points.push(new THREE.Vector3(20, 6, 0));
    this.lineGeo3 = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line3 = new THREE.Line(this.lineGeo3, this.lineMat2);
    this.line3.computeLineDistances();
    this.scene.add(this.line3);

    this.points.shift();
    this.points.push(new THREE.Vector3(40, 0, 0));
    this.lineGeo4 = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line4 = new THREE.Line(this.lineGeo4, this.lineMat2);
    this.line4.computeLineDistances();
    this.scene.add(this.line4);
  }

  initExternal() {
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      //console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    this.manager.onLoad = () => {
      this.loadScene.remove(this.loadingObj);
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'planet1'),
      );
      this.mainScene = this.scene;
      this.isLoaded = true;
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.fillElem.nativeElement.style.width =
        (itemsLoaded / itemsTotal) * 100 + '%';
      this.loadLabelElem.nativeElement.innerText =
        itemsLoaded + ' / ' + itemsTotal + ' objects';
      //console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    this.loader.load('low_poly_earth.gltf', (gltf) => {
      let tempObj = gltf.scene;
      tempObj.scale.multiplyScalar(3);
      tempObj.position.x = 20;
      tempObj.position.y = 6;

      this.earthObj = tempObj;
      this.earthObj.name = 'earth';
      this.planets.push(this.earthObj);

      this.scene.add(tempObj);
    });

    this.loader.load('assets/planet1/planet1.gltf', (gltf) => {
      let tempObj = gltf.scene;
      tempObj.scale.multiplyScalar(0.7);
      tempObj.position.x = 0;
      tempObj.position.y = -6;

      this.planet1Obj = tempObj;
      this.planet1Obj.name = 'planet3';
      this.planets.push(this.planet1Obj);

      this.scene.add(this.planet1Obj);
    });

    this.loader.load('assets/planet2/planet2.gltf', (gltf) => {
      let tempObj = gltf.scene;
      tempObj.scale.multiplyScalar(0.01);

      this.planet2Obj = tempObj;
      this.planet2Obj.position.x = -20;
      this.planet2Obj.position.y = 8;

      this.planet2Obj.name = 'planet2';
      //planet2Obj.add(labelObj2);
      this.planets.push(this.planet2Obj);

      this.scene.add(this.planet2Obj);
    });

    this.loader.load('assets/planet3/planet3.gltf', (gltf) => {
      let tempObj = gltf.scene;
      tempObj.scale.multiplyScalar(0.6);
      tempObj.position.x = -40;
      tempObj.position.y = -8;

      this.planet3Obj = tempObj;
      this.planet3Obj.name = 'planet1';
      //planet3Obj.add(labelObj);
      this.planets.push(this.planet3Obj);

      this.scene.add(this.planet3Obj);
    });

    this.moonMaterial.flatShading = true;

    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 20, 10),
      this.moonMaterial,
    );
    this.moon.position.x = 40;
    this.moon.name = 'moon';
    this.planets.push(this.moon);
    this.scene.add(this.moon);

    Array(600)
      .fill(undefined)
      .forEach(() => this.addStar());
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(this.containerWidth, this.containerHeight);
    this.composer.addPass(this.renderScene);
    this.composer.addPass(this.bloomPass);
  }

  addStar() {
    const randSize = Math.random() * 0.25 + 0.01;

    const geometry = new THREE.SphereGeometry(randSize, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3)
      .fill(undefined)
      .map(() => THREE.MathUtils.randFloatSpread(200));

    star.position.set(x, y / 2.2, z);
    star.name = 'star';

    this.scene.add(star);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.tweenGroup.update();

    if (this.earthObj) {
      this.earthObj.rotation.x -= 0.002;
      this.earthObj.rotation.y -= 0.004;
      this.earthObj.rotation.z += 0.002;
    }
    if (this.planet1Obj) {
      this.planet1Obj.rotation.x -= 0.002;
      this.planet1Obj.rotation.y += 0.004;
      this.planet1Obj.rotation.z += 0.002;
    }
    if (this.planet2Obj) {
      this.planet2Obj.rotation.x += 0.002;
      this.planet2Obj.rotation.y -= 0.004;
      this.planet2Obj.rotation.z -= 0.002;
    }
    if (this.planet3Obj) {
      this.planet3Obj.rotation.x -= 0.002;
      this.planet3Obj.rotation.y += 0.004;
      this.planet3Obj.rotation.z -= 0.002;
    }

    if (this.finalAnimation && this.hoveredFirstPlanet) {
      this.ringMesh.material = this.ringMat;
      this.ringMesh.material.color.getHSL(this.ringColor);

      let minimum = 6.28;
      let closestPoint = 0;
      this.ringPoints.forEach((element) => {
        if (Math.abs(element - this.ringMesh.rotation.z) < minimum) {
          minimum = Math.abs(element - this.ringMesh.rotation.z);
          closestPoint = element;
        }
      });

      if (closestPoint && closestPoint - this.ringMesh.rotation.z > 0) {
        this.ringMesh.rotation.z += 0.1;
      } else {
        this.ringMesh.rotation.z -= 0.1;
      }

      if (this.ringMesh.scale.y > 1.05) {
        this.ringMesh.scale.multiplyScalar(0.997);
      }
      if (this.ringColor.l > 0.3) {
        this.ringMesh.material.color.setHSL(
          this.ringColor.h,
          this.ringColor.s,
          this.ringColor.l - 0.006,
        );
      }

      if (Math.abs(closestPoint - this.ringMesh.rotation.z) < 0.1) {
        this.finalAnimation = false;
        this.ringMesh.rotation.z = 0;
        this.ringMesh.scale.y = 1;
        this.ringMesh.scale.x = 1;

        this.ringMesh.material.color.setHSL(
          this.ringColor.h,
          this.ringColor.s,
          0.29,
        );
      }
    }

    if (!this.hoveredFirstPlanet && this.ringMesh) {
      //4 rotation checkpoints: 0 (6.28), 1.57, 3.14, 4.71
      if (this.ringMesh.rotation.z < 6.28) {
        this.ringMesh.rotation.z += 0.004;
      } else {
        this.ringMesh.rotation.z = 0;
      }
      this.ringMesh.material.color.getHSL(this.ringColor);

      if (this.expand) {
        this.ringMesh.scale.multiplyScalar(1.003);
        this.ringMesh.material.color.setHSL(
          this.ringColor.h,
          this.ringColor.s,
          this.ringColor.l + 0.003,
        );
      } else {
        this.ringMesh.scale.multiplyScalar(0.997);
        this.ringMesh.material.color.setHSL(
          this.ringColor.h,
          this.ringColor.s,
          this.ringColor.l - 0.003,
        );
      }

      if (this.ringMesh.scale.y >= 1.2) {
        this.expand = false;
      } else if (this.ringMesh.scale.y <= 0.99) {
        this.expand = true;
      }
    }

    if (this.intersectsMoon.length > 0 && !this.hoveredFirstPlanet) {
      let tempObj = this.intersectsMoon[0].object;
      while (tempObj.parent != this.scene) {
        if (tempObj.parent) {
          tempObj = tempObj.parent;
        }
      }

      if (tempObj.name == 'planet1') {
        this.hoveredFirstPlanet = true;
        this.finalAnimation = true;
      }
    } else if (
      this.intersectsMoon.length > 0 &&
      this.offset &&
      this.intersectsMoon[0].object.name != 'star' &&
      this.hoveredFirstPlanet
    ) {
      let tempObj = this.intersectsMoon[0].object;
      let tempPos = tempObj.position;
      while (tempObj.parent != this.scene) {
        if (tempObj.parent) {
          tempObj = tempObj.parent;
        }
        tempPos = tempObj.position;
      }

      if (this.availablePlanets.includes(tempObj)) {
        this.ringMesh.material = this.ringMat;
      } else {
        this.ringMesh.material = this.ringMat2;
      }

      this.ringMesh.position.x = tempPos.x;
      this.ringMesh.position.y = tempPos.y;
      this.ringMesh.position.z = tempPos.z;

      this.offset = false;
      this.scene.add(this.ringMesh);
    } else if (
      this.intersectsMoon.length == 0 &&
      !this.offset &&
      this.hoveredFirstPlanet
    ) {
      this.offset = true;
      this.scene.remove(this.ringMesh);
    }

    this.moon.rotation.x += 0.002;
    this.moon.rotation.y += 0.004;
    this.moon.rotation.z += 0.002;

    this.camera.updateProjectionMatrix();
    this.renderer.render(this.mainScene, this.camera);
    this.labelRenderer.render(this.mainScene, this.camera);

    if (this.isLoaded) {
      this.composer.render();
    }
  }

  nextPlanet() {
    let nextObj: THREE.Object3D | undefined = new THREE.Object3D();
    switch (this.selectedPlanet.name) {
      case 'planet1':
        nextObj = this.scene.getObjectByName('planet2');
        break;
      case 'planet2':
        nextObj = this.scene.getObjectByName('planet3');
        break;
      case 'planet3':
        nextObj = this.scene.getObjectByName('earth');
        break;
      case 'earth':
        nextObj = this.scene.getObjectByName('moon');
        break;
      default:
        break;
    }

    if (nextObj) {
      this.goToPlanet(nextObj, 500);
    }
  }

  previousPlanet() {
    let prevObj: THREE.Object3D | undefined = new THREE.Object3D();
    switch (this.selectedPlanet.name) {
      case 'planet2':
        prevObj = this.scene.getObjectByName('planet1');
        break;
      case 'planet3':
        prevObj = this.scene.getObjectByName('planet2');
        break;
      case 'earth':
        prevObj = this.scene.getObjectByName('planet3');
        break;
      case 'moon':
        prevObj = this.scene.getObjectByName('earth');
        break;
      default:
        break;
    }

    this.buttonPrev.nativeElement.style.opacity = 0;
    this.buttonNext.nativeElement.style.opacity = 0;
    this.buttonReset.nativeElement.style.opacity = 0;

    if (prevObj) {
      this.goToPlanet(prevObj, 500);
    }
  }

  goToPlanet(planetObj: THREE.Object3D, animDuration: number) {
    let tempObj = planetObj;
    let tempPos = tempObj.position;
    while (tempObj.parent && tempObj.parent != this.scene) {
      tempObj = tempObj.parent;
      tempPos = tempObj.position;
    }

    this.selectedPlanet = tempObj;

    if (this.selectedPlanet.name == 'planet1' && this.unlockedPlanets == 1) {
      this.unlockedPlanets = 2;
      this.line1.material = this.lineMat;
    } else if (
      this.selectedPlanet.name == 'planet2' &&
      this.unlockedPlanets == 2
    ) {
      this.unlockedPlanets = 3;
      this.line2.material = this.lineMat;
    } else if (
      this.selectedPlanet.name == 'planet3' &&
      this.unlockedPlanets == 3
    ) {
      this.unlockedPlanets = 4;
      this.line3.material = this.lineMat;
    } else if (
      this.selectedPlanet.name == 'earth' &&
      this.unlockedPlanets == 4
    ) {
      this.unlockedPlanets = 5;
      this.line4.material = this.lineMat;
    }

    if (this.unlockedPlanets == 2 && this.availablePlanets.length == 1) {
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'planet2'),
      );
    } else if (this.unlockedPlanets == 3 && this.availablePlanets.length == 2) {
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'planet3'),
      );
    } else if (this.unlockedPlanets == 4 && this.availablePlanets.length == 3) {
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'earth'),
      );
    } else if (this.unlockedPlanets == 5 && this.availablePlanets.length == 4) {
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'moon'),
      );
    }

    let zoom = {
      value: this.camera.zoom,
      left: this.camera.left,
      right: this.camera.right,
      top: this.camera.top,
      bottom: this.camera.bottom,
    };
    let zoomEnd = {
      value: 3.5,
      left: (this.aspect * this.cameraView) / -2 + tempPos.x + 10,
      right: (this.aspect * this.cameraView) / 2 + tempPos.x + 10,
      top: this.cameraView / 2 + tempPos.y,
      bottom: this.cameraView / -2 + tempPos.y,
    };
    let tween = new TWEEN.Tween(zoom, this.tweenGroup)
      .to(zoomEnd, animDuration)
      .easing(TWEEN.Easing.Cubic.Out);
    tween.onUpdate(() => {
      this.camera.zoom = zoom.value;
      this.camera.left = zoom.left;
      this.camera.right = zoom.right;
      this.camera.top = zoom.top;
      this.camera.bottom = zoom.bottom;
    });

    tween.start();

    this.labelElem.nativeElement.classList.remove('disabled');
    this.labelElem2.nativeElement.classList.remove('disabled');
    this.labelElem3.nativeElement.classList.remove('disabled');
    this.labelElem4.nativeElement.classList.remove('disabled');
    this.labelElem5.nativeElement.classList.remove('disabled');
    this.buttonReset.nativeElement.classList.remove('disabled');
    this.buttonPrev.nativeElement.classList.remove('disabled');
    this.buttonNext.nativeElement.classList.remove('disabled');

    if (tempObj.name == 'planet1') {
      setTimeout(() => {
        this.labelElem.nativeElement.style.opacity = 1;
      }, 500);
    } else if (tempObj.name == 'planet2') {
      setTimeout(() => {
        this.labelElem2.nativeElement.style.opacity = 1;
      }, 500);
    } else if (tempObj.name == 'planet3') {
      setTimeout(() => {
        this.labelElem3.nativeElement.style.opacity = 1;
      }, 500);
    } else if (tempObj.name == 'earth') {
      setTimeout(() => {
        this.labelElem4.nativeElement.style.opacity = 1;
      }, 500);
    } else if (tempObj.name == 'moon') {
      setTimeout(() => {
        this.labelElem5.nativeElement.style.opacity = 1;
      }, 500);
    }

    this.resetObj.position.set(tempPos.x + 18, tempPos.y + 4, tempPos.z);
    this.buttonReset.nativeElement.style.opacity = 1;

    if (tempObj.name != 'planet1' && tempObj.name != 'moon') {
      this.prevObj.position.set(
        tempPos.x + this.duoButtonPos[0].x,
        tempPos.y + this.duoButtonPos[0].y,
        tempPos.z,
      );
      this.buttonPrev.nativeElement.style.opacity = 1;

      this.nextObj.position.set(
        tempPos.x + this.duoButtonPos[1].x,
        tempPos.y + this.duoButtonPos[1].y,
        tempPos.z,
      );
      this.buttonNext.nativeElement.style.opacity = 1;

      if (tempObj.name == 'planet2') {
        this.labelObj2.position.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
      } else if (tempObj.name == 'planet3') {
        this.labelObj3.position.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
      } else if (tempObj.name == 'earth') {
        this.labelObj4.position.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
      }
    } else if (tempObj.name == 'planet1') {
      this.labelObj.position.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);

      this.nextObj.position.set(
        tempPos.x + this.singleButtonPos.x,
        tempPos.y + this.singleButtonPos.y,
        tempPos.z + this.singleButtonPos.z,
      );
      this.buttonNext.nativeElement.style.opacity = 1;
    } else if (tempObj.name == 'moon') {
      this.labelObj5.position.set(tempPos.x + 5, tempPos.y + 1.7, tempPos.z);

      this.prevObj.position.set(
        tempPos.x + this.singleButtonPos.x,
        tempPos.y + this.singleButtonPos.y,
        tempPos.z + this.singleButtonPos.z,
      );
      this.buttonPrev.nativeElement.style.opacity = 1;
    }
  }

  resetCamera() {
    if (this.animFix) {
      this.animFix = false;
      this.labelElem.nativeElement.style.opacity = 0;
      this.labelElem.nativeElement.classList.add('disabled');
      this.labelElem2.nativeElement.style.opacity = 0;
      this.labelElem2.nativeElement.classList.add('disabled');
      this.labelElem3.nativeElement.style.opacity = 0;
      this.labelElem3.nativeElement.classList.add('disabled');
      this.labelElem4.nativeElement.style.opacity = 0;
      this.labelElem4.nativeElement.classList.add('disabled');
      this.labelElem5.nativeElement.style.opacity = 0;
      this.labelElem5.nativeElement.classList.add('disabled');
      this.buttonReset.nativeElement.style.opacity = 0;
      this.buttonReset.nativeElement.classList.add('disabled');
      this.buttonPrev.nativeElement.style.opacity = 0;
      this.buttonPrev.nativeElement.classList.add('disabled');
      this.buttonNext.nativeElement.style.opacity = 0;
      this.buttonNext.nativeElement.classList.add('disabled');

      let zoom = {
        value: this.camera.zoom,
        left: this.camera.left,
        right: this.camera.right,
        top: this.camera.top,
        bottom: this.camera.bottom,
      };
      let zoomEnd = {
        value: 1,
        left: (this.aspect * this.cameraView) / -2,
        right: (this.aspect * this.cameraView) / 2,
        top: this.cameraView / 2,
        bottom: this.cameraView / -2,
      };
      let tween = new TWEEN.Tween(zoom, this.tweenGroup).to(zoomEnd, 750);
      tween
        .onUpdate(() => {
          this.camera.zoom = zoom.value;
          this.camera.left = zoom.left;
          this.camera.right = zoom.right;
          this.camera.top = zoom.top;
          this.camera.bottom = zoom.bottom;
        })
        .onComplete(() => {
          this.animFix = true;
        });

      setTimeout(() => {
        tween.start();
      }, 750);
    }
  }

  onPointerClick() {
    if (this.unlockedPlanets == 2 && this.availablePlanets.length == 1) {
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'planet2'),
      );
    } else if (this.unlockedPlanets == 3 && this.availablePlanets.length == 2) {
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'planet3'),
      );
    } else if (this.unlockedPlanets == 4 && this.availablePlanets.length == 3) {
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'earth'),
      );
    } else if (this.unlockedPlanets == 5 && this.availablePlanets.length == 4) {
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'moon'),
      );
    }

    const intersectClick = this.raycaster.intersectObjects(
      this.availablePlanets,
    );
    if (intersectClick.length > 0) {
      this.goToPlanet(intersectClick[0].object, 800);
    }
  }

  onResize() {
    const containerStyles = getComputedStyle(this.container.nativeElement);
    this.containerWidth =
      this.container.nativeElement.clientWidth -
      parseFloat(containerStyles.paddingLeft) -
      parseFloat(containerStyles.paddingRight);
    this.containerHeight = this.container.nativeElement.clientHeight || this.containerHeight;
    // Update renderer size
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.labelRenderer.setSize(this.containerWidth, this.containerHeight);

    this.aspect = (this.containerWidth / 880) * 1.75;

    // Update camera properties

    this.camera.left = (this.aspect * this.cameraView) / -2;
    this.camera.right = (this.aspect * this.cameraView) / 2;
    this.camera.top = this.cameraView / 2;
    this.camera.bottom = this.cameraView / -2;
    this.camera.updateProjectionMatrix();

    // Update composer size if using post-processing
    this.composer.setSize(this.containerWidth, this.containerHeight);
  }

  getSprite({
    color,
    opacity,
    pos,
    size,
  }: {
    color: THREE.Color;
    opacity: number;
    pos: THREE.Vector3;
    size: number;
  }) {
    const spriteMat = new THREE.SpriteMaterial({
      color,
      map: this.nebulaLoader.load('rad-grad.png'),
      transparent: true,
      opacity,
    });
    spriteMat.color.offsetHSL(0, 0, Math.random() * 0.2 - 0.1);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(pos.x, -pos.y, pos.z);
    size += Math.random() - 0.5;
    sprite.scale.set(size, size, size);
    sprite.material.rotation = 0;
    return sprite;
  }

  getNebula({
    hue = 0.0,
    numSprites = 10,
    opacity = 1,
    radius = 1,
    sat = 0.5,
    size = 1,
    z = 0,
    x = 0,
  }) {
    const layerGroup = new THREE.Group();
    for (let i = 0; i < numSprites; i += 1) {
      let angle = (i / numSprites) * Math.PI * 2;
      const pos = new THREE.Vector3(
        x + Math.cos(angle) * Math.random() * radius,
        Math.sin(angle) * Math.random() * radius,
        z + Math.random(),
      );
      const length = new THREE.Vector3(pos.x, pos.y, 0).length();
      //const hue = 0.0; // (0.9 - (radius - length) / radius) * 1;

      let color = new THREE.Color().setHSL(hue, 1, sat);
      const sprite = this.getSprite({ color, opacity, pos, size });
      layerGroup.add(sprite);
    }
    return layerGroup;
  }
}
