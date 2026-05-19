import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
export class OurwayComponent implements OnInit, OnDestroy {
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
  @ViewChild('secretLabel', { static: true }) secretLabelElem!: ElementRef;

  private rafId = 0;
  private resizeHandler = () => this.onResize();

  isMediumScreen = false;

  scene = new THREE.Scene();
  loadScene = new THREE.Scene();
  mainScene = new THREE.Scene();

  singleButtonPos = { x: -1.58, y: -4, z: 0 };
  duoButtonPos = [
    { x: -3.5, y: -4, z: 0 },
    { x: 0, y: -4, z: 0 },
  ];

  cameraView = 45;
  readonly sceneOffsetX = 1.5;
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
  private nebulaTexture = this.nebulaLoader.load('rad-grad.png');

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
  starsPoints!: THREE.Points;
  manager = new THREE.LoadingManager();
  loader = new GLTFLoader(this.manager);
  earthObj = new THREE.Object3D();
  planet1Obj = new THREE.Object3D();
  planet2Obj = new THREE.Object3D();
  planet3Obj = new THREE.Object3D();
  selectedPlanet = new THREE.Object3D();

  // Rings

  ringGeo = new THREE.RingGeometry(4.2, 4.55, 4);
  ringMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: new THREE.Color(0x8b5cf6), emissiveIntensity: 1.4, side: THREE.DoubleSide });
  ringMat2 = new THREE.MeshStandardMaterial({ color: 0x555577, emissive: new THREE.Color(0x333355), emissiveIntensity: 0.5, side: THREE.DoubleSide });
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

  // Rocket
  rocket = new THREE.Group();
  rocketThrusterLight = new THREE.PointLight(0xff6600, 5, 10, 2);
  rocketTarget = new THREE.Vector3();
  isRocketTraveling = false;
  rocketFlame!: THREE.Mesh;
  rocketFlameGlow!: THREE.MeshStandardMaterial;
  rocketSpeed = 0;

  // Camera follow
  cameraAnchor = new THREE.Vector2(-40, -8);
  isCameraFollowing = false;
  isExplorationMode = false;

  // Secret planet
  secretPlanetMesh!: THREE.Mesh;
  secretPlanetMat!: THREE.MeshStandardMaterial;
  secretPlanetLight = new THREE.PointLight(0x9333ea, 0.4, 30, 2);
  secretPlanetLabelObj!: CSS2DObject;
  secretFound = false;

  // Label parallax
  labelBasePos = new THREE.Vector3();

  // Raycasting
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  constructor(stateManager: StateManagerService) {
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
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.intersectsMoon = this.raycaster.intersectObjects(this.planets, true);

    if (this.isLoaded && !this.isRocketTraveling) {
      const wp = new THREE.Vector3(this.pointer.x, this.pointer.y, 0).unproject(
        this.camera,
      );
      this.rocketTarget.set(
        Math.max(-95, Math.min(150, wp.x)),
        Math.max(-40, Math.min(40, wp.y)),
        1,
      );
    }
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

  // Pathing — thin emissive tubes so bloom picks them up
  tubeMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: new THREE.Color(0x7c3aed), emissiveIntensity: 0.55, roughness: 1 });
  tubeMatLocked = new THREE.MeshStandardMaterial({ color: 0x2d2d45, emissive: new THREE.Color(0x1a1a2e), emissiveIntensity: 0.18, roughness: 1 });

  tubeGeo1!: THREE.TubeGeometry;
  tube1!: THREE.Mesh;
  tubeGeo2!: THREE.TubeGeometry;
  tube2!: THREE.Mesh;
  tubeGeo3!: THREE.TubeGeometry;
  tube3!: THREE.Mesh;
  tubeGeo4!: THREE.TubeGeometry;
  tube4!: THREE.Mesh;

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeHandler);

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });

    this.starsPoints?.geometry.dispose();
    (this.starsPoints?.material as THREE.Material)?.dispose();

    this.ringGeo.dispose();
    this.ringMat.dispose();
    this.ringMat2.dispose();
    this.tubeMat.dispose();
    this.tubeMatLocked.dispose();

    this.composer.dispose();
    this.renderer.dispose();
    this.labelRenderer.domElement.remove();
  }

  ngOnInit(): void {
    const containerStyles = getComputedStyle(this.container.nativeElement);
    this.containerWidth =
      this.container.nativeElement.clientWidth -
      parseFloat(containerStyles.paddingLeft) -
      parseFloat(containerStyles.paddingRight);
    this.containerHeight = this.container.nativeElement.clientHeight || 480;
    window.addEventListener('resize', this.resizeHandler);
    this.aspect = (this.containerWidth / 880) * 1.75;
    this.camera = new THREE.OrthographicCamera(
      (this.aspect * this.cameraView) / -2 + this.cameraAnchor.x,
      (this.aspect * this.cameraView) / 2 + this.cameraAnchor.x,
      this.cameraView / 2 + this.cameraAnchor.y,
      this.cameraView / -2 + this.cameraAnchor.y,
      0.1,
      1000,
    );
    this.camera.zoom = 1.3;
    this.camera.updateProjectionMatrix();
    this.renderScene = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.containerWidth, this.containerHeight),
      1.6,
      0.4,
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
    this.scene.background = new THREE.Color(0x06001a);

    this.buildRocket();
    this.buildSecretPlanet();
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
    this.loadingObj.position.set(this.cameraAnchor.x, this.cameraAnchor.y, 0);
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
    this.labelRenderer.domElement.style.left = `0`;

    // Append CSS2DRenderer to the Angular container
    this.labelContainer.nativeElement.appendChild(
      this.labelRenderer.domElement,
    );
  }

  initPathing() {
    const makeTube = (from: THREE.Vector3, to: THREE.Vector3) =>
      new THREE.TubeGeometry(new THREE.LineCurve3(from, to), 1, 0.1, 5, false);

    this.tubeGeo1 = makeTube(new THREE.Vector3(-40, -8, 0), new THREE.Vector3(-20, 8, 0));
    this.tube1 = new THREE.Mesh(this.tubeGeo1, this.tubeMatLocked);
    this.scene.add(this.tube1);

    this.tubeGeo2 = makeTube(new THREE.Vector3(-20, 8, 0), new THREE.Vector3(0, -6, 0));
    this.tube2 = new THREE.Mesh(this.tubeGeo2, this.tubeMatLocked);
    this.scene.add(this.tube2);

    this.tubeGeo3 = makeTube(new THREE.Vector3(0, -6, 0), new THREE.Vector3(20, 6, 0));
    this.tube3 = new THREE.Mesh(this.tubeGeo3, this.tubeMatLocked);
    this.scene.add(this.tube3);

    this.tubeGeo4 = makeTube(new THREE.Vector3(20, 6, 0), new THREE.Vector3(40, 0, 0));
    this.tube4 = new THREE.Mesh(this.tubeGeo4, this.tubeMatLocked);
    this.scene.add(this.tube4);
  }

  initExternal() {
    this.manager.onStart = () => {};

    this.manager.onLoad = () => {
      this.loadScene.remove(this.loadingObj);
      this.availablePlanets.push(
        this.planets.find((element) => element.name == 'planet1'),
      );
      this.mainScene = this.scene;
      this.isCameraFollowing = true;
      this.isLoaded = true;
    };

    this.manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      this.fillElem.nativeElement.style.width =
        (itemsLoaded / itemsTotal) * 100 + '%';
      this.loadLabelElem.nativeElement.innerText =
        itemsLoaded + ' / ' + itemsTotal + ' objects';
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
      tempObj.scale.multiplyScalar(0.6);
      tempObj.position.x = -40;
      tempObj.position.y = -8;

      this.planet1Obj = tempObj;
      this.planet1Obj.name = 'planet1';
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
      this.planets.push(this.planet2Obj);

      this.scene.add(this.planet2Obj);
    });

    this.loader.load('assets/planet3/planet3.gltf', (gltf) => {
      let tempObj = gltf.scene;
      tempObj.scale.multiplyScalar(0.7);
      tempObj.position.x = 0;
      tempObj.position.y = -6;

      this.planet3Obj = tempObj;
      this.planet3Obj.name = 'planet3';
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

    this.addStars();
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(this.containerWidth, this.containerHeight);
    this.composer.addPass(this.renderScene);
    this.composer.addPass(this.bloomPass);
  }

  addStars() {
    const count = 1100;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // X extends further right (-100 to +160) to cover the secret planet area
      positions[i * 3] = THREE.MathUtils.randFloatSpread(260) + 30;
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(200) / 2.2;
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(200);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      sizeAttenuation: true,
    });

    this.starsPoints = new THREE.Points(geometry, material);
    this.scene.add(this.starsPoints);
  }

  buildRocket() {
    const silver = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.25,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x222233,
      metalness: 0.5,
      roughness: 0.4,
    });
    const glow = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: new THREE.Color(0xff3300),
      emissiveIntensity: 0,
      roughness: 1,
    });
    this.rocketFlameGlow = glow;

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.4, 7),
      silver,
    );
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 7), silver);
    nose.position.y = 1.05;
    const engine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 0.5, 7),
      dark,
    );
    engine.position.y = -0.95;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.9, 6), glow);
    flame.position.y = -1.65;
    flame.rotation.x = Math.PI;
    flame.visible = false;
    this.rocketFlame = flame;

    this.rocketThrusterLight.position.set(0, -1.65, 0);

    this.rocket.add(body, nose, engine, flame, this.rocketThrusterLight);
    this.rocket.scale.setScalar(0.7);
    this.rocket.visible = false;
    this.scene.add(this.rocket);
  }

  travelRocket(fromPos: THREE.Vector3, toPos: THREE.Vector3, duration: number) {
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    this.rocket.rotation.z = -Math.atan2(dx, dy);
    this.rocket.position.set(fromPos.x, fromPos.y, 1);
    this.isRocketTraveling = true;

    const pos = { x: fromPos.x, y: fromPos.y };
    new TWEEN.Tween(pos, this.tweenGroup)
      .to({ x: toPos.x, y: toPos.y }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.rocket.position.x = pos.x;
        this.rocket.position.y = pos.y;
      })
      .onComplete(() => {
        this.isRocketTraveling = false;
        this.rocketTarget.set(toPos.x, toPos.y, 1);
      })
      .start();
  }

  buildSecretPlanet() {
    this.secretPlanetMat = new THREE.MeshStandardMaterial({
      color: 0x5b1a8a,
      emissive: new THREE.Color(0x3d0d6b),
      emissiveIntensity: 0.2,
      flatShading: true,
      roughness: 0.85,
    });
    this.secretPlanetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 16, 8),
      this.secretPlanetMat,
    );
    this.secretPlanetMesh.position.set(130, 10, 0);
    this.secretPlanetLight.position.set(130, 10, 4);

    this.secretPlanetLabelObj = new CSS2DObject(this.secretLabelElem.nativeElement);
    this.secretPlanetLabelObj.position.set(134, 14, 0);
    this.secretPlanetLabelObj.center.set(0, 0);

    this.scene.add(this.secretPlanetMesh, this.secretPlanetLight, this.secretPlanetLabelObj);
  }

  private getActiveLabelObj(): CSS2DObject | null {
    switch (this.selectedPlanet.name) {
      case 'planet1': return this.labelObj;
      case 'planet2': return this.labelObj2;
      case 'planet3': return this.labelObj3;
      case 'earth':   return this.labelObj4;
      case 'moon':    return this.labelObj5;
      default:        return null;
    }
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

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

    // Pulse emissive intensity on unlocked path tubes
    this.tubeMat.emissiveIntensity = Math.sin(Date.now() * 0.0018) * 0.2 + 0.55;

    // Camera follow
    if (this.isCameraFollowing) {
      const hw = (this.camera.right - this.camera.left) / 2;
      const hh = (this.camera.top - this.camera.bottom) / 2;
      const cx = (this.camera.left + this.camera.right) / 2;
      const cy = (this.camera.top + this.camera.bottom) / 2;
      let targetCX: number, targetCY: number;

      if (this.isExplorationMode) {
        const visHW = hw / this.camera.zoom;
        const visHH = hh / this.camera.zoom;

        // Keep rocket target under cursor as camera pans (world pos shifts with camera)
        if (this.isLoaded && !this.isRocketTraveling) {
          const wp = new THREE.Vector3(this.pointer.x, this.pointer.y, 0).unproject(this.camera);
          this.rocketTarget.set(
            Math.max(-95, Math.min(150, wp.x)),
            Math.max(-40, Math.min(40, wp.y)),
            1,
          );
        }

        // Screen-space edge pan: cursor NDC drives the anchor, not rocket world pos.
        // This way panning continues even when the cursor is stationary at the edge.
        // Quadratic curve: slow near threshold, fast near screen edge.
        const edgeThreshold = 0.5;
        const panStrength = 0.55;
        if (Math.abs(this.pointer.x) > edgeThreshold) {
          const t = (Math.abs(this.pointer.x) - edgeThreshold) / (1 - edgeThreshold);
          this.cameraAnchor.x += Math.sign(this.pointer.x) * t * t * panStrength;
        }
        if (Math.abs(this.pointer.y) > edgeThreshold) {
          const t = (Math.abs(this.pointer.y) - edgeThreshold) / (1 - edgeThreshold);
          this.cameraAnchor.y += Math.sign(this.pointer.y) * t * t * panStrength * 0.6;
        }

        // Clamp anchor so camera edges never leave the star field (left:-100, right:+155, Y:±45)
        this.cameraAnchor.x = Math.max(
          visHW - 100,
          Math.min(155 - visHW, this.cameraAnchor.x),
        );
        this.cameraAnchor.y = Math.max(
          visHH - 45,
          Math.min(45 - visHH, this.cameraAnchor.y),
        );
        targetCX = this.cameraAnchor.x;
        targetCY = this.cameraAnchor.y;
      } else {
        const parallax = 8 / this.camera.zoom;
        targetCX = this.cameraAnchor.x + this.pointer.x * parallax;
        targetCY = this.cameraAnchor.y + this.pointer.y * parallax * 0.6;
      }

      const newCX = cx + (targetCX - cx) * 0.04;
      const newCY = cy + (targetCY - cy) * 0.04;
      this.camera.left = newCX - hw;
      this.camera.right = newCX + hw;
      this.camera.top = newCY + hh;
      this.camera.bottom = newCY - hh;
      this.camera.updateProjectionMatrix();
    }

    // Rocket cursor follow — lerp toward target, capped at 0.8 wu/frame
    if (this.isLoaded && !this.isRocketTraveling) {
      const prev = this.rocket.position.clone();
      const toTarget = new THREE.Vector3().subVectors(this.rocketTarget, this.rocket.position);
      const dist = toTarget.length();
      if (dist > 0.001) {
        const step = Math.min(dist * 0.12, 0.8);
        this.rocket.position.addScaledVector(toTarget.normalize(), step);
      }
      this.rocket.visible = true;

      const dx = this.rocket.position.x - prev.x;
      const dy = this.rocket.position.y - prev.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      this.rocketSpeed += (speed - this.rocketSpeed) * 0.2;

      if (Math.abs(dx) > 0.015 || Math.abs(dy) > 0.015) {
        this.rocket.rotation.z = -Math.atan2(dx, dy);
      }

      // Flame and thruster light scale with velocity
      const t = Math.min(this.rocketSpeed / 0.1, 1);
      this.rocketFlame.visible = t > 0.04;
      this.rocketFlameGlow.emissiveIntensity = t * 2.5;
      this.rocketThrusterLight.intensity = t * 6;
    }

    // Secret planet: rotate, proximity glow, discovery trigger
    if (this.secretPlanetMesh) {
      this.secretPlanetMesh.rotation.y += 0.004;
      this.secretPlanetMesh.rotation.x += 0.001;

      if (this.isExplorationMode && this.isLoaded) {
        const sdx = this.rocket.position.x - this.secretPlanetMesh.position.x;
        const sdy = this.rocket.position.y - this.secretPlanetMesh.position.y;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
        const glowT = Math.max(0, Math.min(1, 1 - (sdist - 4) / 22));
        this.secretPlanetMat.emissiveIntensity = 0.2 + glowT * 2.2;
        this.secretPlanetLight.intensity = 0.4 + glowT * 5.5;

        if (sdist < 7 && !this.secretFound) {
          this.secretFound = true;
          this.secretLabelElem.nativeElement.classList.remove('disabled');
          this.secretLabelElem.nativeElement.style.opacity = '1';
        }
      }
    }

    // Label parallax: nudge active label in world-space with cursor when zoomed in
    if (this.isCameraFollowing && !this.isExplorationMode) {
      const activeLabelObj = this.getActiveLabelObj();
      if (activeLabelObj) {
        const px = this.pointer.x * 0.22;
        const py = this.pointer.y * 0.14;
        activeLabelObj.position.set(
          this.labelBasePos.x + px,
          this.labelBasePos.y + py,
          this.labelBasePos.z,
        );
      }
    }

    if (this.isLoaded) {
      this.composer.render();
    } else {
      this.renderer.render(this.mainScene, this.camera);
    }
    this.labelRenderer.render(this.mainScene, this.camera);
  }

  nextPlanet() {
    if (this.selectedPlanet.name === 'moon') {
      this.buttonPrev.nativeElement.style.opacity = 0;
      this.buttonNext.nativeElement.style.opacity = 0;
      this.buttonReset.nativeElement.style.opacity = 0;
      this.enterExploration();
      return;
    }

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
      this.buttonPrev.nativeElement.style.opacity = 0;
      this.buttonNext.nativeElement.style.opacity = 0;
      this.buttonReset.nativeElement.style.opacity = 0;
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
    this.isCameraFollowing = false;
    this.isExplorationMode = false;
    this.buttonNext.nativeElement.innerText = 'Next →';

    let tempObj = planetObj;
    let tempPos = tempObj.position;
    while (tempObj.parent && tempObj.parent != this.scene) {
      tempObj = tempObj.parent;
      tempPos = tempObj.position;
    }

    const prevPlanetPos = this.selectedPlanet.name
      ? this.selectedPlanet.position.clone()
      : null;

    this.selectedPlanet = tempObj;

    if (this.selectedPlanet.name == 'planet1' && this.unlockedPlanets == 1) {
      this.unlockedPlanets = 2;
      this.tube1.material = this.tubeMat;
    } else if (
      this.selectedPlanet.name == 'planet2' &&
      this.unlockedPlanets == 2
    ) {
      this.unlockedPlanets = 3;
      this.tube2.material = this.tubeMat;
    } else if (
      this.selectedPlanet.name == 'planet3' &&
      this.unlockedPlanets == 3
    ) {
      this.unlockedPlanets = 4;
      this.tube3.material = this.tubeMat;
    } else if (
      this.selectedPlanet.name == 'earth' &&
      this.unlockedPlanets == 4
    ) {
      this.unlockedPlanets = 5;
      this.tube4.material = this.tubeMat;
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
      value: 2.5,
      left: (this.aspect * this.cameraView) / -2 + tempPos.x + 10,
      right: (this.aspect * this.cameraView) / 2 + tempPos.x + 10,
      top: this.cameraView / 2 + tempPos.y,
      bottom: this.cameraView / -2 + tempPos.y,
    };
    let tween = new TWEEN.Tween(zoom, this.tweenGroup)
      .to(zoomEnd, animDuration)
      .easing(TWEEN.Easing.Cubic.Out);
    tween
      .onUpdate(() => {
        this.camera.zoom = zoom.value;
        this.camera.left = zoom.left;
        this.camera.right = zoom.right;
        this.camera.top = zoom.top;
        this.camera.bottom = zoom.bottom;
        this.camera.updateProjectionMatrix();
      })
      .onComplete(() => {
        this.cameraAnchor.set(tempPos.x + 10, tempPos.y);
        this.isCameraFollowing = true;
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
        this.labelBasePos.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
      } else if (tempObj.name == 'planet3') {
        this.labelObj3.position.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
        this.labelBasePos.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
      } else if (tempObj.name == 'earth') {
        this.labelObj4.position.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
        this.labelBasePos.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
      }
    } else if (tempObj.name == 'planet1') {
      this.labelObj.position.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);
      this.labelBasePos.set(tempPos.x + 5, tempPos.y + 2.65, tempPos.z);

      this.nextObj.position.set(
        tempPos.x + this.singleButtonPos.x,
        tempPos.y + this.singleButtonPos.y,
        tempPos.z + this.singleButtonPos.z,
      );
      this.buttonNext.nativeElement.style.opacity = 1;
    } else if (tempObj.name == 'moon') {
      this.labelObj5.position.set(tempPos.x + 5, tempPos.y + 1.7, tempPos.z);
      this.labelBasePos.set(tempPos.x + 5, tempPos.y + 1.7, tempPos.z);

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
      this.buttonNext.nativeElement.innerText = 'Explore →';
      this.buttonNext.nativeElement.style.opacity = 1;
    }

    if (prevPlanetPos) {
      this.travelRocket(prevPlanetPos, tempPos.clone(), animDuration);
    }
  }

  resetCamera() {
    // Once exploration is unlocked, X always jumps to exploration instead of zooming out.
    if (this.unlockedPlanets >= 5) {
      this.enterExploration();
      return;
    }

    // Zooms out to overview level centered on the current planet, no UI shown.
    if (this.animFix) {
      this.animFix = false;
      this.isCameraFollowing = false;

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

      const planetPos = this.selectedPlanet?.position ?? new THREE.Vector3();
      const zoom = {
        value: this.camera.zoom,
        left: this.camera.left,
        right: this.camera.right,
        top: this.camera.top,
        bottom: this.camera.bottom,
      };
      const zoomEnd = {
        value: 1.3,
        left: (this.aspect * this.cameraView) / -2 + planetPos.x,
        right: (this.aspect * this.cameraView) / 2 + planetPos.x,
        top: this.cameraView / 2 + planetPos.y,
        bottom: this.cameraView / -2 + planetPos.y,
      };

      setTimeout(() => {
        new TWEEN.Tween(zoom, this.tweenGroup)
          .to(zoomEnd, 750)
          .easing(TWEEN.Easing.Cubic.Out)
          .onUpdate(() => {
            this.camera.zoom = zoom.value;
            this.camera.left = zoom.left;
            this.camera.right = zoom.right;
            this.camera.top = zoom.top;
            this.camera.bottom = zoom.bottom;
            this.camera.updateProjectionMatrix();
          })
          .onComplete(() => {
            this.animFix = true;
            this.cameraAnchor.set(planetPos.x, planetPos.y);
            this.isCameraFollowing = true;
          })
          .start();
      }, 750);
    }
  }

  enterExploration() {
    // Hides UI, pans camera to the rocket's current position, then enters exploration mode.
    if (this.animFix) {
      this.animFix = false;
      this.isCameraFollowing = false;

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

      // Capture rocket world position now so the tween target is stable
      const rx = this.rocket.position.x;
      const ry = this.rocket.position.y;

      const zoom = {
        value: this.camera.zoom,
        left: this.camera.left,
        right: this.camera.right,
        top: this.camera.top,
        bottom: this.camera.bottom,
      };
      const zoomEnd = {
        value: 1.8,
        left: (this.aspect * this.cameraView) / -2 + rx,
        right: (this.aspect * this.cameraView) / 2 + rx,
        top: this.cameraView / 2 + ry,
        bottom: this.cameraView / -2 + ry,
      };

      setTimeout(() => {
        new TWEEN.Tween(zoom, this.tweenGroup)
          .to(zoomEnd, 900)
          .easing(TWEEN.Easing.Cubic.InOut)
          .onUpdate(() => {
            this.camera.zoom = zoom.value;
            this.camera.left = zoom.left;
            this.camera.right = zoom.right;
            this.camera.top = zoom.top;
            this.camera.bottom = zoom.bottom;
            this.camera.updateProjectionMatrix();
          })
          .onComplete(() => {
            this.animFix = true;
            this.cameraAnchor.set(rx, ry);
            this.isExplorationMode = true;
            this.isCameraFollowing = true;
          })
          .start();
      }, 600);
    }
  }

  onPointerClick() {
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
    this.containerHeight =
      this.container.nativeElement.clientHeight || this.containerHeight;
    // Update renderer size
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.labelRenderer.setSize(this.containerWidth, this.containerHeight);

    this.aspect = (this.containerWidth / 880) * 1.75;

    // Update camera properties

    this.camera.left =
      (this.aspect * this.cameraView) / -2 + this.cameraAnchor.x;
    this.camera.right =
      (this.aspect * this.cameraView) / 2 + this.cameraAnchor.x;
    this.camera.top = this.cameraView / 2 + this.cameraAnchor.y;
    this.camera.bottom = this.cameraView / -2 + this.cameraAnchor.y;
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
      map: this.nebulaTexture,
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
    lightness = 0.5,
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
      let color = new THREE.Color().setHSL(hue, 1, lightness);
      const sprite = this.getSprite({ color, opacity, pos, size });
      layerGroup.add(sprite);
    }
    return layerGroup;
  }
}
