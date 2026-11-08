# Спецификация утвержденных промптов для категорий билетов (Tickets)

Каждая категория билетов использует индивидуальную, самодостаточную директиву для генерации фотореалистичных промптов через **Llama 3.2 3B Instruct** (`temperature: 0.9`, без общего системного промпта), которые затем передаются во **FLUX.1-schnell** (8 шагов).

---

## 1. Авиаперелет (`airplane`) — УТВЕРЖДЕНО
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood: the plane is taking off or landing
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 2. Театр (`theater`) — УТВЕРЖДЕНО
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood:  view from theater Balcony of  performance on Main stage
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."
CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 3. Автобус / Трамвай (`bus_tram`) — УТВЕРЖДЕНО
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood: Passenger POV looking forward down the center aisle of a modern city bus
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. View from 3rd row down the wide central aisle through the large front windshield.
3. Elements: Clear city street view through the front window, neat passenger seats and handrails framing the aisle, sunlit city architecture outside, bright natural daylight.
4. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
5. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 5. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 4. Кинотеатр (`cinema`) — УТВЕРЖДЕНО
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood: Center seat POV looking directly at a colossal glowing cinema screen
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Straight-ahead eye-level view facing the giant screen.
3. Elements: Colossal brightly illuminated widescreen displaying a vivid cinematic landscape, powerful glow illuminating empty rows of seats ahead, atmospheric theater darkness with vibrant screen reflections.
4. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
5. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 5. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 5. Поезд / Вокзал (`train_station`) — УТВЕРЖДЕНО
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood: The train travels along the railway
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3 . Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 6. Концерт (`concert`) — УТВЕРЖДЕНО (V2)
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood:  View from the standing area towards the stadium concert stage
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 7. Стадион (`stadium`) — УТВЕРЖДЕНО (V3)
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood:  view from Upper tier to World-class championship. 
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 8. Парк аттракционов (`amusement_park`) — УТВЕРЖДЕНО (V7)
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood:  Top view of an amusement park
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 9. Музей (`museum`) — УТВЕРЖДЕНО (V1)
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood:  Grand exhibition hall in the museum
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 10. Водный транспорт (`water_transport`) — УТВЕРЖДЕНО (V6)
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood:  A cruise ship is sailing on the sea
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 11. Горнолыжный курорт (`ski_resort`) — УТВЕРЖДЕНО (V1)
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood:  Ski resort
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## 12. Цирк (`circus`) — УТВЕРЖДЕНО (V65)
```text
Create ONE photorealistic image prompt in English, no more than 60 words, for the Flux project.
RULES:
1. Subject & Mood: A festive grand circus show inside an authentic circular circus building from an elevated spectator view. In the center is strictly ONE single classic circular circus ring (manège) with a traditional raised red velvet border. The circular ring is completely surrounded on all sides by a packed full house of spectators in steeply tiered amphitheater stands. On the brightly illuminated circular arena floor, a colorful grand parade of circus performers in dazzling costumes takes place. Beams of vibrant colored spotlights and festive haze cut across the space under the soaring circus dome. Strictly no concert stage, no text, authentic 360-degree circular circus arena.
2. Composition: Elevated perspective looking down at strictly ONE central circular circus arena ring, fully encircled by packed tiered audience stands, centered for vertical phone screens.
3. Clean Focus: Strictly ONE single circular circus ring, no concert stages, no multiple rings, packed full auditorium, strictly no text or letters.
4. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 4. No introductory filler, no markdown blocks, starting immediately with the scene description.
```

---

## Итог согласования:
Все 12 из 12 категорий билетов согласованы и утверждены!
