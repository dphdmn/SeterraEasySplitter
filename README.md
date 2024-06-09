# SeterraEasySplitter
An AutoSplitter for [Seterra](https://www.geoguessr.com/quiz/seterra).

## Installation
1. Install [Monkey](https://www.tampermonkey.net/index.php?ext=dhdg&browser=chrome).
2. Install the [Script](https://github.com/dphdmn/SeterraEasySplitter/raw/main/ses.user.js).

## Video Demonstration
(You can find a demonstration at the end of my video, though I might provide a better demo later along with an improved readme file) 

[Watch Here](https://youtu.be/l_yZfMBdvuk?t=73).

## Updates:
- **2023:** The script stopped working due to changes in the website. Thanks, Seterra!
- **2024:** Successfully adapted the script to the new version. Well, somewhat.

### Version 2.0.0:
Key Considerations and Issues with Migration to New Platform:

1. **Dependency on Obfuscated Seterra Code**:
   - The current code relies on several unconventional methods to parse data from the page, which may break if Seterra's code undergoes changes. This necessitates caution and ongoing monitoring for potential disruptions.

2. **Custom Timer for Results Tracking**:
   - Due to the obfuscation of Seterra's code, the existing solution utilizes a custom timer. Consequently, recorded times may not perfectly align with in-game measurements.

3. **Complex Parsing Process**:
   - The parsing code's complexity stems from the necessity to wait for country data to populate on the page, introducing potential bugs related to tracking clicked country names. While functional, this aspect requires further testing to ensure robustness.

4. **Inconsistent PBs Tracking**:
   - Personal bests (PBs) tracking is currently tied to specific URLs, potentially categorizing similar game modes differently based on URL parameters.

5. **Suboptimal Splits Stats Container**:
   - The container for splits statistics employs an "article" block, leading to the removal of content under "Map Games." While functional, this layout may be improved in future iterations for better user experience.

6. **Dark Mode**:
   - Graphs look the best with the dark mode plugin from [Seterra Extra](https://github.com/Sinskiy/seterraextra). Might be improved for light mode later.

This version represents a functional revival of the project, with potential areas for refinement and optimization in subsequent iterations.
