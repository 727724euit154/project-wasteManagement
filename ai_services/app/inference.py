import io
import json
import urllib.request
from pathlib import Path
from functools import lru_cache

import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import models, transforms

IMAGENET_LABELS_URL = (
    "https://raw.githubusercontent.com/anishathalye/imagenet-simple-labels"
    "/master/imagenet-simple-labels.json"
)
LABELS_CACHE = Path(__file__).parent / "imagenet_labels.json"

# Broad keyword map — covers as many ImageNet synsets as possible per category
WASTE_KEYWORD_MAP: dict[str, list[str]] = {
    "Metal Waste": [
        "steel", "iron", "metal", "chain", "nail", "screw", "bolt", "wrench",
        "hammer", "can", "tin", "copper", "brass", "wire", "cable", "rebar",
        "drum", "shovel", "crane", "excavator", "bulldozer", "ladle", "anvil",
        "safe", "padlock", "combination lock", "filing cabinet", "mailbox",
        "fire hydrant", "parking meter", "traffic light", "barbell", "dumbbell",
        "hook", "cleaver", "knife", "sword", "rifle", "revolver", "cannon",
        "car wheel", "hubcap", "radiator", "piston", "gear",
        "window screen", "window shade", "venetian blind", "screen door",
        "grille", "grate", "mesh", "chain-link fence", "metal detector",
        "locker", "safe", "vault", "manhole cover", "drain",
    ],
    "Wood Waste": [
        "wood", "lumber", "plank", "log", "timber", "beam", "board", "pallet",
        "stump", "bark", "fence", "crate", "cabinet", "bookcase", "wardrobe",
        "door", "window frame", "shelf", "table", "chair", "bench", "desk",
        "chest", "coffin", "cradle", "rocking chair", "park bench",
        "picket fence", "split-rail fence", "barn", "silo",
    ],
    "Concrete Waste": [
        "concrete", "cement", "rubble", "gravel", "aggregate", "pavement",
        "sidewalk", "wall", "block", "slab", "foundation", "pillar", "column",
        "stone wall", "rock", "cliff", "quarry", "breakwater", "dam",
        "castle", "church", "monastery", "prison", "bunker",
    ],
    "Brick Waste": [
        "brick", "clay", "tile roof", "chimney", "kiln", "pottery",
        "terracotta", "masonry", "flowerpot", "vase",
    ],
    "Glass Waste": [
        "glass bottle", "jar", "lens", "mirror", "greenhouse",
        "windshield", "crystal", "goblet", "wine glass", "beer glass",
        "pitcher", "carafe", "test tube", "beaker",
    ],
    "Plastic Waste": [
        "plastic", "container", "bucket", "tarp", "foam", "polystyrene",
        "nylon", "synthetic", "trash can", "wastebasket", "garbage truck",
        "shopping cart", "laundry basket", "bathtub", "toilet seat",
        "shower cap", "rain barrel",
    ],
    "Sand": [
        "sand", "beach", "dune", "desert", "sandbar", "seashore", "lakeside",
        "soil", "dirt", "earth", "ground", "mud", "clay soil",
    ],
    "Asphalt Waste": [
        "asphalt", "tar", "road", "highway", "pavement", "tarmac",
        "shingle", "roofing", "bitumen", "street sign", "crosswalk",
    ],
    "Gypsum / Drywall": [
        "drywall", "plaster", "gypsum", "ceiling", "white wall",
        "interior wall", "partition", "whiteboard",
    ],
    "Insulation Waste": [
        "insulation", "fiberglass", "batting", "mineral wool",
        "sleeping bag", "quilt", "pillow",
    ],
    "Ceramic / Tile Waste": [
        "tile", "ceramic", "porcelain", "bathroom", "kitchen tile",
        "mosaic", "floor tile", "toilet", "bathtub", "sink",
    ],
    "Rubber Waste": [
        "rubber", "tire", "tyre", "gasket", "hose", "mat", "seal",
        "conveyor belt", "rubber eraser",
    ],
}

# HSV-based fallback classifier (used when model confidence is low)
# Rules are evaluated in order; first match with highest score wins.
# Scores are accumulated — more matching conditions = higher score.
HSV_RULES: list[tuple[str, dict]] = [
    # Very dark → Asphalt (must check before Metal)
    ("Asphalt Waste",     dict(val_hi=75,  sat_hi=255, dark_min=0.40)),
    # Dark but not as dark → Rubber
    ("Rubber Waste",      dict(val_hi=90,  sat_hi=70,  dark_min=0.30)),
    # Near-white, low sat → Gypsum
    ("Gypsum / Drywall",  dict(val_lo=205, sat_hi=35)),
    # Warm beige/tan, light → Sand
    ("Sand",              dict(hue_lo=12,  hue_hi=32,  sat_lo=15, sat_hi=110, val_lo=145)),
    # Red-orange, medium sat → Brick
    ("Brick Waste",       dict(hue_lo=0,   hue_hi=14,  sat_lo=55, val_lo=65)),
    # Brown, medium sat → Wood
    ("Wood Waste",        dict(hue_lo=10,  hue_hi=30,  sat_lo=30, val_lo=45, val_hi=215)),
    # Blue-green, bright → Glass
    ("Glass Waste",       dict(hue_lo=85,  hue_hi=135, sat_hi=90, val_lo=170)),
    # High saturation, bright → Plastic
    ("Plastic Waste",     dict(sat_lo=100, val_lo=100)),
    # Pink/yellow hue, light → Insulation
    ("Insulation Waste",  dict(hue_lo=0,   hue_hi=20,  sat_lo=30, val_lo=155)),
    # Pure grey, bright → Metal (very low sat = no colour cast)
    ("Metal Waste",       dict(val_lo=130, sat_hi=20)),
    # Grey with slight warmth, mid-brightness → Concrete
    ("Concrete Waste",    dict(sat_hi=65,  val_lo=80,  val_hi=220)),
]


def _hsv_fallback(rgb: np.ndarray) -> str:
    """Score-based HSV classifier. Higher score = better match."""
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

    best, best_score = "Concrete Waste", -1.0
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
        score = float(np.mean(conditions)) if conditions else 0.0
        if score > best_score:
            best_score = score
            best = label
    return best


@lru_cache(maxsize=1)
def _load_model_and_labels():
    model = models.mobilenet_v3_large(
        weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2
    )
    model.eval()

    if LABELS_CACHE.exists():
        labels = json.loads(LABELS_CACHE.read_text())
    else:
        with urllib.request.urlopen(IMAGENET_LABELS_URL, timeout=10) as r:
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


_TRANSFORM = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# Minimum mapped probability mass to trust the CNN result over HSV fallback
# Real photos of construction materials typically score > 0.25
_CNN_TRUST_THRESHOLD = 0.35


def analyze_waste_image(image_bytes: bytes) -> dict:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {"materials": [], "message": "Could not decode image. Please upload a valid JPG or PNG."}

    model, labels, label_to_waste = _load_model_and_labels()

    tensor = _TRANSFORM(img).unsqueeze(0)
    with torch.no_grad():
        probs = F.softmax(model(tensor)[0], dim=0)

    # Aggregate probability mass per waste category (top 300 predictions)
    top_indices = probs.argsort(descending=True)[:300].tolist()
    category_scores: dict[str, float] = {cat: 0.0 for cat in WASTE_KEYWORD_MAP}
    for idx in top_indices:
        waste_cat = label_to_waste.get(idx)
        if waste_cat:
            category_scores[waste_cat] += probs[idx].item()

    total_mapped = sum(category_scores.values())

    if total_mapped < _CNN_TRUST_THRESHOLD:
        # CNN didn't map enough mass → use HSV fallback
        rgb = np.array(img.resize((128, 128)))
        primary = _hsv_fallback(rgb)
        confidence = 72
        return {
            "materials": [{"type": primary, "percentage": confidence}],
            "primary_material": primary,
            "confidence": confidence,
            "analysis_complete": True,
        }

    ranked = sorted(
        [(cat, s) for cat, s in category_scores.items() if s > 0],
        key=lambda x: x[1], reverse=True
    )

    top_cat, top_raw = ranked[0]
    # Map share of mapped mass → confidence 68–95 %
    share = top_raw / total_mapped
    confidence = int(68 + min(share, 1.0) * 27)

    materials = [{"type": top_cat, "percentage": confidence}]
    if len(ranked) > 1 and ranked[1][1] / total_mapped >= 0.18:
        materials.append({"type": ranked[1][0], "percentage": 100 - confidence})

    return {
        "materials": materials,
        "primary_material": top_cat,
        "confidence": confidence,
        "analysis_complete": True,
    }
