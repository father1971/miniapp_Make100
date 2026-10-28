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
1. Subject & Mood: Front row balcony POV looking down at an ornate theater stage
2. Composition: Ensure a natural dynamic perspective with wide field of view, keeping the focal depth centered for vertical phone screens. Never use flat rigid box-like angles or tiny tunnel windows.
3. Elements: Grand theater stage with rich red velvet curtain or live performance, warm spotlight illumination, decorative gilded balcony railing in lower foreground.
4. Clean Focus: No distorted limbs, no faces looking straight into the camera, no giant disembodied text, and no unrealistic fantasy elements.
5. End with: "Shot on iPhone 15 Pro, balanced HDR exposure, cinematic lighting, photorealistic, sharp focus, ultra-detailed."

CRITICAL FORMAT REQUIREMENT: 
Output ONLY the final raw prompt text, ending strictly with the exact phrase from Rule 5. No introductory filler, no markdown blocks, starting immediately with the scene description.
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

## Оставшиеся категории для согласования (7 из 12):
6. Концерт (`concert`)
7. Стадион (`stadium`)
8. Парк аттракционов (`amusement_park`)
9. Музей (`museum`)
10. Водный транспорт (`water_transport`)
11. Горнолыжный курорт (`ski_resort`)
12. Цирк (`circus`)
