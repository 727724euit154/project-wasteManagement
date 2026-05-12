import io
import json
import urllib.request
from pathlib import Path
from functools import lru_cache

import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import torch
import torch.nn.functional as F
from torchvision import models, transforms

IMAGENET_LABELS_URL = (
    "https://raw.githubusercontent.com/anishathalye/imagenet-simple-labels"
    "/master/imagenet-simple-labels.json"
)
LABELS_CACHE = Path(__file__).parent / "imagenet_labels.json"

# Comprehensive keyword map covering all ImageNet synsets relevant to construction waste
WASTE_KEYWORD_MAP: dict[str, list[str]] = {
    "Metal Waste": [
        "steel", "iron", "metal", "chain", "nail", "screw", "bolt", "wrench",
        "hammer", "can", "tin", "copper", "brass", "wire", "cable", "rebar",
        "drum", "shovel", "crane", "excavator", "bulldozer", "ladle", "anvil",
        "safe", "padlock", "filing cabinet", "mailbox", "fire hydrant",
        "parking meter", "barbell", "dumbbell", "hook", "cleaver", "knife",
        "car wheel", "hubcap", "radiator", "piston", "gear", "grille", "grate",
        "mesh", "chain-link fence", "locker", "manhole cover", "drain",
        "bucket", "pail", "trowel", "chisel", "saw", "drill", "wrench",
        "pipe", "duct", "conduit", "beam", "girder", "truss", "scaffold",
        "corrugated", "sheet metal", "foil", "tin can", "barrel",
    ],
    "Wood Waste": [
        "wood", "lumber", "plank", "log", "timber", "beam", "board", "pallet",
        "stump", "bark", "fence", "crate", "cabinet", "bookcase", "wardrobe",
        "door", "window frame", "shelf", "table", "chair", "bench", "desk",
        "chest", "coffin", "cradle", "rocking chair", "park bench",
        "picket fence", "split-rail fence", "barn", "silo", "hardwood",
        "plywood", "chipboard", "mdf", "particle board", "decking",
        "floorboard", "joist", "rafter", "stud", "framing",
    ],
    "Concrete Waste": [
        "concrete", "cement", "rubble", "gravel", "aggregate", "pavement",
        "sidewalk", "wall", "block", "slab", "foundation", "pillar", "column",
        "stone wall", "rock", "cliff", "quarry", "breakwater", "dam",
        "castle", "church", "monastery", "prison", "bunker", "curb",
        "retaining wall", "cinder block", "masonry block", "precast",
        "reinforced concrete", "debris", "rubble pile", "demolition",
    ],
    "Brick Waste": [
        "brick", "clay", "tile roof", "chimney", "kiln", "pottery",
        "terracotta", "masonry", "flowerpot", "vase", "red brick",
        "fire brick", "paving brick", "cobblestone", "flagstone",
    ],
    "Glass Waste": [
        "glass bottle", "jar", "lens", "mirror", "greenhouse",
        "windshield", "crystal", "goblet", "wine glass", "beer glass",
        "pitcher", "carafe", "test tube", "beaker", "window glass",
        "tempered glass", "safety glass", "glass panel", "glazing",
        "skylight", "glass block", "frosted glass",
    ],
    "Plastic Waste": [
        "plastic", "container", "bucket", "tarp", "foam", "polystyrene",
        "nylon", "synthetic", "trash can", "wastebasket", "garbage truck",
        "shopping cart", "laundry basket", "bathtub", "toilet seat",
        "shower cap", "rain barrel", "pipe fitting", "pvc", "hdpe",
        "polypropylene", "polyethylene", "shrink wrap", "bubble wrap",
        "plastic sheet", "plastic bag", "packaging",
    ],
    "Sand": [
        "sand", "beach", "dune", "desert", "sandbar", "seashore", "lakeside",
        "soil", "dirt", "earth", "ground", "mud", "clay soil", "gravel pit",
        "fill dirt", "topsoil", "subsoil", "aggregate pile",
    ],
    "Asphalt Waste": [
        "asphalt", "tar", "road", "highway", "pavement", "tarmac",
        "shingle", "roofing", "bitumen", "street sign", "crosswalk",
        "parking lot", "driveway", "blacktop", "macadam", "road surface",
    ],
    "Gypsum / Drywall": [
        "drywall", "plaster", "gypsum", "ceiling", "white wall",
        "interior wall", "partition", "whiteboard", "plasterboard",
        "wallboard", "sheetrock", "stucco", "render",
    ],
    "Insulation Waste": [
        "insulation", "fiberglass", "batting", "mineral wool",
        "sleeping bag", "quilt", "pillow", "foam board", "rigid foam",
        "spray foam", "rockwool", "glasswool", "cellulose insulation",
        "vapor barrier", "house wrap",
    ],
    "Ceramic / Tile Waste": [
        "tile", "ceramic", "porcelain", "bathroom", "kitchen tile",
        "mosaic", "floor tile", "toilet", "bathtub", "sink",
        "wall tile", "roof tile", "terracotta tile", "quarry tile",
        "glazed tile", "unglazed tile", "grout",
    ],
    "Rubber Waste": [
        "rubber", "tire", "tyre", "gasket", "hose", "mat", "seal",
        "conveyor belt", "rubber eraser", "rubber sheet", "neoprene",
        "epdm", "weatherstripping", "rubber flooring",
    ],
}

# Enhanced HSV rules with more precise thresholds
HSV_RULES: list[tuple[str, dict]] = [
    ("Asphalt Waste",      dict(val_hi=70,  sat_hi=255, dark_min=0.45)),
    ("Rubber Waste",       dict(val_hi=85,  sat_hi=60,  dark_min=0.35)),
    ("Gypsum / Drywall",   dict(val_lo=210, sat_hi=30)),
    ("Sand",               dict(hue_lo=12,  hue_hi=30,  sat_lo=20, sat_hi=100, val_lo=150)),
    ("Brick Waste",        dict(hue_lo=0,   hue_hi=12,  sat_lo=60, val_lo=70)),
    ("Wood Waste",         dict(hue_lo=10,  hue_hi=28,  sat_lo=35, val_lo=50, val_hi=210)),
    ("Glass Waste",        dict(hue_lo=88,  hue_hi=130, sat_hi=85, val_lo=175)),
    ("Ceramic / Tile Waste", dict(hue_lo=0, hue_hi=180, sat_lo=20, sat_hi=80, val_lo=160)),
    ("Plastic Waste",      dict(sat_lo=110, val_lo=110)),
    ("Insulation Waste",   dict(hue_lo=0,   hue_hi=22,  sat_lo=25, val_lo=160)),
    ("Metal Waste",        dict(val_lo=135, sat_hi=22)),
    ("Concrete Waste",     dict(sat_hi=60,  val_lo=85,  val_hi=215)),
]


def _hsv_fallback(rgb: np.ndarray) -> tuple[str, int]:
    """Score-based HSV classifier. Returns (label, confidence 60-80)."""
    f = rgb.astype(np.float32) / 255.0
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    delta = cmax - cmin
    v = cmax
    s = np.where(cmax > 0, delta / cmax, 0.0)
    h = np.zeros_like(r)
    mr = (cmax == r) & (delta > 0)
    mg = (cmax == g) & (delta > 0)
    mb = (cmax == b) & (delta > 0)
    h[mr] = (60 * ((g[mr] - b[mr]) / delta[mr])) % 360
    h[mg] = 60 * ((b[mg] - r[mg]) / delta[mg]) + 120
    h[mb] = 60 * ((r[mb] - g[mb]) / delta[mb]) + 240
    h = (h / 2.0).ravel()
    s = (s * 255).ravel()
    v = (v * 255).ravel()
    dark_frac = (v < 50).mean()

    scores: dict[str, float] = {}
    for label, rule in HSV_RULES:
        conditions = []
        if "hue_lo" in rule and "hue_hi" in rule:
            conditions.append(((h >= rule["hue_lo"]) & (h <= rule["hue_hi"])).mean())
        if "sat_lo" in rule:
            conditions.append((s >= rule["sat_lo"]).mean())
        if "sat_hi" in rule:
            conditions.append((s <= rule["sat_hi"]).mean())
        if "val_lo" in rule:
            conditions.append((v >= rule["val_lo"]).mean())
        if "val_hi" in rule:
            conditions.append((v <= rule["val_hi"]).mean())
        if "dark_min" in rule:
            conditions.append(1.0 if dark_frac >= rule["dark_min"] else 0.0)
        scores[label] = float(np.mean(conditions)) if conditions else 0.0

    best = max(scores, key=lambda k: scores[k])
    best_score = scores[best]
    # Map score 0.5-1.0 → confidence 62-80
    confidence = int(62 + min(best_score, 1.0) * 18)
    return best, confidence


def _texture_score(rgb: np.ndarray) -> dict[str, float]:
    """Simple texture features to boost classification confidence."""
    gray = np.mean(rgb, axis=2).astype(np.uint8)
    # Variance = roughness indicator
    variance = float(np.var(gray))
    # Edge density via simple gradient
    gy = np.abs(np.diff(gray.astype(np.float32), axis=0)).mean()
    gx = np.abs(np.diff(gray.astype(np.float32), axis=1)).mean()
    edge_density = float((gx + gy) / 2)
    return {"variance": variance, "edge_density": edge_density}


@lru_cache(maxsize=1)
def _load_model_and_labels():
    # EfficientNet-B4 — better accuracy than MobileNetV3 for fine-grained classification
    try:
        model = models.efficientnet_b4(
            weights=models.EfficientNet_B4_Weights.IMAGENET1K_V1
        )
    except Exception:
        # Fallback to MobileNetV3 if EfficientNet not available
        model = models.mobilenet_v3_large(
            weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2
        )
    model.eval()

    if LABELS_CACHE.exists():
        labels = json.loads(LABELS_CACHE.read_text())
    else:
        with urllib.request.urlopen(IMAGENET_LABELS_URL, timeout=15) as r:
            labels = json.loads(r.read())
        LABELS_CACHE.write_text(json.dumps(labels))

    label_to_waste: dict[int, str] = {}
    for idx, label in enumerate(labels):
        ll = label.lower()
        for waste_cat, keywords in WASTE_KEYWORD_MAP.items():
            if any(kw in ll for kw in keywords):
                label_to_waste[idx] = waste_cat
                break

    return model, labels, label_to_waste


# Multi-scale transforms for ensemble
_TRANSFORMS = [
    transforms.Compose([
        transforms.Resize(380),
        transforms.CenterCrop(380),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]),
    transforms.Compose([
        transforms.Resize(256),
        transforms.RandomCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]),
    transforms.Compose([
        transforms.Resize(320),
        transforms.CenterCrop(300),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]),
]

_CNN_TRUST_THRESHOLD = 0.25  # Lower threshold — EfficientNet maps more labels


def _run_ensemble(model, img: Image.Image) -> dict[str, float]:
    """Run model on multiple crops and average the category scores."""
    category_scores: dict[str, float] = {cat: 0.0 for cat in WASTE_KEYWORD_MAP}
    _, _, label_to_waste = _load_model_and_labels()

    # Also try contrast-enhanced version
    enhanced = ImageEnhance.Contrast(img).enhance(1.4)
    images_to_try = [img, enhanced]

    count = 0
    for src_img in images_to_try:
        for tfm in _TRANSFORMS:
            try:
                tensor = tfm(src_img).unsqueeze(0)
                with torch.no_grad():
                    probs = F.softmax(model(tensor)[0], dim=0)
                top_indices = probs.argsort(descending=True)[:300].tolist()
                for idx in top_indices:
                    waste_cat = label_to_waste.get(idx)
                    if waste_cat:
                        category_scores[waste_cat] += probs[idx].item()
                count += 1
            except Exception:
                continue

    if count > 1:
        for k in category_scores:
            category_scores[k] /= count

    return category_scores


def analyze_waste_image(image_bytes: bytes) -> dict:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {"materials": [], "message": "Could not decode image. Please upload a valid JPG or PNG."}

    # Resize very large images for speed
    if max(img.size) > 1024:
        img.thumbnail((1024, 1024), Image.LANCZOS)

    model, labels, label_to_waste = _load_model_and_labels()
    rgb_arr = np.array(img.resize((128, 128)))
    texture = _texture_score(rgb_arr)

    # Run ensemble CNN
    category_scores = _run_ensemble(model, img)
    total_mapped = sum(category_scores.values())

    if total_mapped < _CNN_TRUST_THRESHOLD:
        # CNN confidence too low → use HSV fallback
        primary, confidence = _hsv_fallback(rgb_arr)
        return {
            "materials": [{"type": primary, "percentage": confidence}],
            "primary_material": primary,
            "confidence": confidence,
            "analysis_method": "hsv_fallback",
            "analysis_complete": True,
        }

    ranked = sorted(
        [(cat, s) for cat, s in category_scores.items() if s > 0],
        key=lambda x: x[1], reverse=True
    )

    top_cat, top_raw = ranked[0]
    share = top_raw / total_mapped

    # Boost confidence for high-texture images (rough surfaces = construction waste)
    texture_boost = min(texture["edge_density"] / 15.0, 5.0)
    confidence = int(min(68 + share * 27 + texture_boost, 96))

    materials = [{"type": top_cat, "percentage": confidence}]

    # Add secondary material if significant
    if len(ranked) > 1:
        second_share = ranked[1][1] / total_mapped
        if second_share >= 0.15:
            second_conf = int(100 - confidence)
            if second_conf >= 15:
                materials.append({"type": ranked[1][0], "percentage": second_conf})

    # Add tertiary if very mixed
    if len(ranked) > 2:
        third_share = ranked[2][1] / total_mapped
        if third_share >= 0.12 and len(materials) < 3:
            third_conf = max(10, 100 - confidence - (materials[1]["percentage"] if len(materials) > 1 else 0))
            materials.append({"type": ranked[2][0], "percentage": third_conf})

    return {
        "materials": materials,
        "primary_material": top_cat,
        "confidence": confidence,
        "analysis_method": "efficientnet_ensemble",
        "texture_score": round(texture["edge_density"], 2),
        "analysis_complete": True,
    }
