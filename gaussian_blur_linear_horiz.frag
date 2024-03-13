#version 450
#extension GL_ARB_separate_shader_objects : enable

// #define WINDOW3X3
#define WINDOW5X5
// #define WINDOW7X7

layout(location = 0) out vec4 color;
layout(binding = 0) uniform sampler2D colorTex;
layout(location = 0) in vec2 texCoord;

const float sigma = 3.0f;

#ifdef WINDOW3X3
void blur3x3()
{
  const vec2 discrete_weights = vec2(0.5, exp(-0.5 / (sigma * sigma)));
	const float linear_weight = discrete_weights.x + discrete_weights.y;
  // const float weights_sum = 2 * linear_weight;
  const float texOffset = discrete_weights.y / linear_weight * dFdxFine(texCoord.x);

  vec3 sum = textureLod(colorTex, texCoord + vec2(texOffset, 0), 0).rgb;
  sum += textureLod(colorTex, texCoord - vec2(texOffset, 0), 0).rgb;
  // color = vec4(sum * linear_weight / weights_sum, 1.0);
  color = vec4(sum / 2, 1.0);
}
#endif

#ifdef WINDOW5X5
void blur5x5()
{
  const vec2 discrete_weights = exp(-vec2(0.5, 2) / (sigma * sigma)); 
  const float linear_weight = discrete_weights.x + discrete_weights.y;
  const float weights_sum = 1 + 2 * linear_weight;
  const float texOffset = (discrete_weights.x + 2 * discrete_weights.y) / linear_weight * dFdxFine(texCoord.x);

  vec3 sum = textureLod(colorTex, texCoord - vec2(texOffset, 0), 0).rgb;
  sum = (sum + textureLod(colorTex, texCoord + vec2(texOffset, 0), 0).rgb) * linear_weight;
  sum += textureLod(colorTex, texCoord, 0).rgb;
  color = vec4(sum / weights_sum, 1.0);
}
#endif

#ifdef WINDOW7X7
void blur7x7()
{
  const vec4 discrete_weights = vec4(0.5, exp(-vec3(0.5, 2.0, 4.5) / (sigma * sigma)));
  const float weights_sum = (discrete_weights.x + discrete_weights.y + discrete_weights.z + discrete_weights.w) * 2;
  const vec2 linear_weights = vec2(discrete_weights.x + discrete_weights.y, discrete_weights.z + discrete_weights.w);
  const vec2 texOffsets = vec2(discrete_weights.y, 2 * discrete_weights.z + 3 * discrete_weights.w) / linear_weights * dFdxFine(texCoord.x);

  vec3 sum = (textureLod(colorTex, texCoord - vec2(texOffsets.x, 0), 0).rgb +
              textureLod(colorTex, texCoord + vec2(texOffsets.x, 0), 0).rgb) * linear_weights.x;
  sum += (textureLod(colorTex, texCoord - vec2(texOffsets.y, 0), 0).rgb +
          textureLod(colorTex, texCoord + vec2(texOffsets.y, 0), 0).rgb) * linear_weights.y;
  color = vec4(sum / weights_sum, 1.0);
}
#endif

void main()
{  
  #ifdef WINDOW3X3
    blur3x3();
  #endif
  #ifdef WINDOW5X5
    blur5x5();
  #endif
  #ifdef WINDOW7X7
    blur7x7();
  #endif
}