#version 450
#extension GL_ARB_separate_shader_objects : enable

// #define WINDOW3X3
// #define WINDOW5X5
#define WINDOW7X7

layout(location = 0) out vec4 color;
layout(binding = 0) uniform sampler2D colorTex;
layout(location = 0) in vec2 texCoord;

const float sigma = 3.0f;

#ifdef WINDOW3X3
void blur3x3()
{
  const vec2 offset = vec2(dFdxFine(texCoord.x), dFdyFine(texCoord.y));
  
  const vec2 exp_vec = exp(-vec2(0.5, 1) / (sigma * sigma));
  const float w = 1 + 4 * (exp_vec.x + exp_vec.y);

  vec3 sum, tmp;
    
  tmp  = textureLod(colorTex, texCoord + offset * vec2(-1, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 1), 0).rgb;
  sum  = tmp * exp_vec.y;
  
  tmp  = textureLod(colorTex, texCoord + offset * vec2(0, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(0, 1), 0).rgb;
  sum += tmp * exp_vec.x + textureLod(colorTex, texCoord, 0).rgb;

  color = vec4(sum / w, 1.0);
}
#endif

#ifdef WINDOW5X5
void blur5x5()
{
  const vec2 offset = vec2(dFdxFine(texCoord.x), dFdyFine(texCoord.y));
  const vec4 exp_vec = exp(-vec4(0.5, 1, 2, 2.5) / (sigma * sigma));
  const float e_last = exp(-4.0 / (sigma * sigma));

  const float w = 1 + 4 * (exp_vec.x + exp_vec.y + exp_vec.z + 2 * exp_vec.w + e_last);

  vec3 sum, tmp;
  
  tmp  = textureLod(colorTex, texCoord + offset * vec2(-2, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, 2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, 2), 0).rgb;
  sum  = tmp * e_last;

  tmp  = textureLod(colorTex, texCoord + offset * vec2(-1, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 2), 0).rgb;
  sum += tmp * exp_vec.w;

  tmp  = textureLod(colorTex, texCoord + offset * vec2(0, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(0, 2), 0).rgb;
  sum += tmp * exp_vec.z;

  tmp  = textureLod(colorTex, texCoord + offset * vec2(-1, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 1), 0).rgb;
  sum += tmp * exp_vec.y;

  tmp  = textureLod(colorTex, texCoord + offset * vec2(0, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(0, 1), 0).rgb;
  sum += tmp * exp_vec.x + textureLod(colorTex, texCoord, 0).rgb;
  
  color = vec4(sum / w, 1.0);
}
#endif

#ifdef WINDOW7X7
void blur7x7()
{
  const vec2 offset = vec2(dFdxFine(texCoord.x), dFdyFine(texCoord.y));

  const float exp_vec_first = exp(-0.5 / (sigma * sigma));
  const vec4 exp_vec_second = exp(-vec4(1, 2, 2.5, 4) / (sigma * sigma));
  const vec4 exp_vec_third = exp(-vec4(4.5, 5, 6.5, 9) / (sigma * sigma));

  const float w = 1 + 4 * (exp_vec_first + exp_vec_second.x + exp_vec_second.y
                  + exp_vec_second.w + exp_vec_third.x + exp_vec_third.w
                  + 2 * (exp_vec_second.z + exp_vec_third.y + exp_vec_third.z));

  vec3 sum, tmp;

  tmp  = textureLod(colorTex, texCoord + offset * vec2(-3, -3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(3, -3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-3, 3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(3, 3), 0).rgb;
  sum = tmp * exp_vec_third.w;

  tmp = textureLod(colorTex, texCoord + offset * vec2(-2, -3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, -3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-3, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(3, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-3, 2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(3, 2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, 3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, 3), 0).rgb;
  sum += tmp * exp_vec_third.z;

  tmp = textureLod(colorTex, texCoord + offset * vec2(-1, -3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, -3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-3, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(3, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-3, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(3, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 3), 0).rgb;
  sum += tmp * exp_vec_third.y;
  
  tmp = textureLod(colorTex, texCoord + offset * vec2(0, -3), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-3, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(3, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(0, 3), 0).rgb;
  sum += tmp * exp_vec_third.x;
  
  tmp = textureLod(colorTex, texCoord + offset * vec2(-2, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, 2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, 2), 0).rgb;
  sum += tmp * exp_vec_second.w;
  
  tmp = textureLod(colorTex, texCoord + offset * vec2(-1, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 2), 0).rgb;
  sum += tmp * exp_vec_second.z;

  tmp = textureLod(colorTex, texCoord + offset * vec2(0, -2), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-2, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(2, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(0, 2), 0).rgb;
  sum += tmp * exp_vec_second.y;

  tmp = textureLod(colorTex, texCoord + offset * vec2(-1, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 1), 0).rgb;
  sum += tmp * exp_vec_second.x;
  
  tmp = textureLod(colorTex, texCoord + offset * vec2(0, -1), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(-1, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(1, 0), 0).rgb;
  tmp += textureLod(colorTex, texCoord + offset * vec2(0, 1), 0).rgb;
  sum += tmp * exp_vec_first + textureLod(colorTex, texCoord, 0).rgb;

  color = vec4(sum / w, 1.0);
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