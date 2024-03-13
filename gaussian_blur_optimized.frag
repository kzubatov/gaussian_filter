#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "diff_swap.h" 

// #define WINDOW3X3
// #define WINDOW5X5
#define WINDOW7X7

layout(location = 0) out vec4 color;

layout(binding = 0) uniform sampler2D colorTex;

layout(location = 0) in vec2 texCoord;

const float sigma = 3.00000;

#ifdef WINDOW3X3
void blur3x3()
{
  const vec2 offset = vec2(dFdxFine(texCoord.x), dFdyFine(texCoord.y));
  const bvec2 isOdd = bvec2(ivec2(gl_FragCoord.xy) & 1);
  const vec2 t = vec2(isOdd) * -2.0 + 1.0;

  const vec3 exp_vec = exp(-vec3(0.5, 1, -0.5) / (sigma * sigma));
  const float w = 1 + 4 * (exp_vec.x + exp_vec.y);

  vec3 topRow, bottomRow;
  vec3 texel_0, texel_1;
  
  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-1, -1), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord + offset * vec2(1, -1), 0).rgb;
  x_swap(texel_1, texel_0, topRow, isOdd.x);
  topRow = topRow * exp_vec.x + (texel_0 + texel_1) * exp_vec.y;

  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-1, 1), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord + offset * vec2(1, 1), 0).rgb;
  x_swap(texel_1, texel_0, bottomRow, isOdd.x);
  bottomRow = bottomRow * exp_vec.x + (texel_0 + texel_1) * exp_vec.y;

  y_swap(bottomRow, topRow, texel_0, isOdd.y);
  color = vec4((topRow + texel_0 * exp_vec.z + bottomRow) / w, 1.0);
}
#endif

#ifdef WINDOW5X5
void blur5x5()
{
  const vec2 offset = vec2(dFdxFine(texCoord.x), dFdyFine(texCoord.y));
  const bvec2 isOdd = bvec2(ivec2(gl_FragCoord.xy) & 1);
  const vec2 t = vec2(isOdd) * -2.0 + 1.0;
  
  const vec4 exp_vec = exp(-vec4(0.5, 1, 2, 2.5) / (sigma * sigma));
  const float e_last = exp(-4.0 / (sigma * sigma));
  const float e_offset_3 = exp(1.5 / (sigma * sigma));
  const float w = 1 + 4 * (exp_vec.x + exp_vec.y + exp_vec.z + 2 * exp_vec.w + e_last);

  vec3 topRow, middleRow, bottomRow;
  vec3 texel_0, texel_1, texel_2;

  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-2, -2), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord + offset * vec2(0, -2), 0).rgb;
  texel_2 = textureLod(colorTex, texCoord + offset * vec2(2, -2), 0).rgb;
  x_swap((texel_1 + texel_2) * exp_vec.w, (texel_0 + texel_1) * exp_vec.w, topRow, isOdd.x);
  topRow += (texel_0 + texel_2) * e_last + texel_1 * exp_vec.z;

  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-2, 0), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord, 0).rgb;
  texel_2 = textureLod(colorTex, texCoord + offset * vec2(2, 0), 0).rgb;
  x_swap((texel_1 + texel_2) * exp_vec.x, (texel_0 + texel_1) * exp_vec.x, middleRow, isOdd.x);
  middleRow += (texel_0 + texel_2) * exp_vec.z + texel_1;

  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-2, 2), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord + offset * vec2(0, 2), 0).rgb;
  texel_2 = textureLod(colorTex, texCoord + offset * vec2(2, 2), 0).rgb;
  x_swap((texel_1 + texel_2) * exp_vec.w, (texel_0 + texel_1) * exp_vec.w, bottomRow, isOdd.x);
  bottomRow += (texel_0 + texel_2) * e_last + texel_1 * exp_vec.z;

  texel_0 = topRow + middleRow + bottomRow;
  y_swap(middleRow * exp_vec.x, topRow * e_offset_3, topRow, isOdd.y);
  y_swap(bottomRow * e_offset_3, middleRow * exp_vec.x, middleRow, isOdd.y);

  color= vec4((texel_0 + topRow + middleRow) / w, 1.0);
}
#endif

#ifdef WINDOW7X7
void blur7x7()
{
  const vec2 offset = vec2(dFdxFine(texCoord.x), dFdyFine(texCoord.y));
  const bvec2 isOdd = bvec2(ivec2(gl_FragCoord.xy) & 1);
  const vec2 t = vec2(isOdd) * -2.0 + 1.0;

  const float exp_vec_first = exp(-0.5 / (sigma * sigma));
  const vec4 exp_vec_second = exp(-vec4(1, 2, 2.5, 4) / (sigma * sigma));
  const vec4 exp_vec_third = exp(-vec4(4.5, 5, 6.5, 9) / (sigma * sigma));
  const vec3 exp_offset = exp(vec3(-1.5, 0.5, 2.5) / (sigma * sigma));

  const float w = 1 + 4 * (exp_vec_first + exp_vec_second.x + exp_vec_second.y 
                  + exp_vec_second.w + exp_vec_third.x + exp_vec_third.w
                  + 2 * (exp_vec_second.z + exp_vec_third.y + exp_vec_third.z));

  vec3 row0, row1, row2, row3;
  vec3 texel_0, texel_1, texel_2, texel_3;

  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-3, -3), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord + offset * vec2(-1, -3), 0).rgb;
  texel_2 = textureLod(colorTex, texCoord + offset * vec2(1, -3), 0).rgb;
  texel_3 = textureLod(colorTex, texCoord + offset * vec2(3, -3), 0).rgb;
  x_swap((texel_1 + texel_3) * exp_vec_third.z + texel_2 * exp_vec_third.x, 
         (texel_0 + texel_2) * exp_vec_third.z + texel_1 * exp_vec_third.x,
          row0, isOdd.x);
  row0 += (texel_0 + texel_3) * exp_vec_third.w + (texel_1 + texel_2) * exp_vec_third.y;

  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-3, -1), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord + offset * vec2(-1, -1), 0).rgb;
  texel_2 = textureLod(colorTex, texCoord + offset * vec2(1, -1), 0).rgb;
  texel_3 = textureLod(colorTex, texCoord + offset * vec2(3, -1), 0).rgb;
  x_swap((texel_1 + texel_3) * exp_vec_second.z + texel_2 * exp_vec_first, 
         (texel_0 + texel_2) * exp_vec_second.z + texel_1 * exp_vec_first,
          row1, isOdd.x);
  row1 += (texel_0 + texel_3) * exp_vec_third.y + (texel_1 + texel_2) * exp_vec_second.x;  

  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-3, 1), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord + offset * vec2(-1, 1), 0).rgb;
  texel_2 = textureLod(colorTex, texCoord + offset * vec2(1, 1), 0).rgb;
  texel_3 = textureLod(colorTex, texCoord + offset * vec2(3, 1), 0).rgb;
  x_swap((texel_1 + texel_3) * exp_vec_second.z + texel_2 * exp_vec_first, 
         (texel_0 + texel_2) * exp_vec_second.z + texel_1 * exp_vec_first,
          row2, isOdd.x);
  row2 += (texel_0 + texel_3) * exp_vec_third.y + (texel_1 + texel_2) * exp_vec_second.x;
  
  texel_0 = textureLod(colorTex, texCoord + offset * vec2(-3, 3), 0).rgb;
  texel_1 = textureLod(colorTex, texCoord + offset * vec2(-1, 3), 0).rgb;
  texel_2 = textureLod(colorTex, texCoord + offset * vec2(1, 3), 0).rgb;
  texel_3 = textureLod(colorTex, texCoord + offset * vec2(3, 3), 0).rgb;
  x_swap((texel_1 + texel_3) * exp_vec_third.z + texel_2 * exp_vec_third.x, 
         (texel_0 + texel_2) * exp_vec_third.z + texel_1 * exp_vec_third.x,
          row3, isOdd.x);
  row3 += (texel_0 + texel_3) * exp_vec_third.w + (texel_1 + texel_2) * exp_vec_third.y;

  y_swap(row1 * exp_offset.x + row2 * exp_offset.y + row3 * exp_offset.z,
         row0 * exp_offset.z + row1 * exp_offset.y + row2 * exp_offset.x, 
         texel_0, isOdd.y);

  color = vec4((texel_0 + row0 + row1 + row2 + row3) / w, 1.0);
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