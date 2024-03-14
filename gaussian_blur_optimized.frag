#version 450

layout(constant_id = 0) const int WINDOW_R = 1;

layout(location = 0) out vec4 color;

layout(binding = 0) uniform sampler2D colorTex;

layout(location = 0) in vec2 texCoord;

layout(push_constant) uniform params_t {
    vec2 offset;               //  1.0 / vec2(width, height)
    float gaussian_divisor;    // -1.0 / (2.0 * sigma_d * sigma_d)
} params;

void blur3x3()
{
    const bvec2 isOdd = bvec2(ivec2(gl_FragCoord.xy) & 1);
    const vec2 t = vec2(isOdd) * -2.0 + 1.0;

    const vec3 exp_vec = exp(vec3(1.0, 2.0, -1.0) * params.gaussian_divisor);
    const float w = 1.0 + 4.0 * (exp_vec.x + exp_vec.y);

    vec3 topRow, bottomRow;
    vec3 texel_0, texel_1;
    
    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-1, -1), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord + params.offset * vec2( 1, -1), 0).rgb;
    topRow = isOdd.x ? texel_0 : texel_1;
    topRow += dFdxFine(topRow) * t.x;
    topRow = topRow * exp_vec.x + (texel_0 + texel_1) * exp_vec.y;

    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-1,  1), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord + params.offset * vec2( 1,  1), 0).rgb;
    bottomRow = isOdd.x ? texel_0 : texel_1;
    bottomRow += dFdxFine(bottomRow) * t.x;
    bottomRow = bottomRow * exp_vec.x + (texel_0 + texel_1) * exp_vec.y;

    texel_0 = isOdd.y ? topRow : bottomRow;
    texel_0 += dFdyFine(texel_0) * t.y;
    color = vec4((topRow + texel_0 * exp_vec.z + bottomRow) / w, 1.0);
}

void blur5x5()
{
    const bvec2 isOdd = bvec2(ivec2(gl_FragCoord.xy) & 1);
    const vec2 t = vec2(isOdd) * -2.0 + 1.0;
    
    const vec4 exp_vec_first = exp(vec4(1.0, 2.0, 4.0, 5.0) * params.gaussian_divisor);
    const vec2 exp_vec_second = exp(vec2(8.0, -3.0) * params.gaussian_divisor);
    const float w = 1.0 + 4.0 * (exp_vec_first.x + exp_vec_first.y + exp_vec_first.z + 2 * exp_vec_first.w + exp_vec_second.x);

    vec3 topRow, middleRow, bottomRow;
    vec3 texel_0, texel_1, texel_2;

    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-2, -2), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord + params.offset * vec2( 0, -2), 0).rgb;
    texel_2 = textureLod(colorTex, texCoord + params.offset * vec2( 2, -2), 0).rgb;
    topRow = isOdd.x ? texel_0 : texel_2;
    topRow += texel_1;
    topRow += dFdxFine(topRow) * t.x;
    topRow = (texel_0 + texel_2) * exp_vec_second.x + texel_1 * exp_vec_first.z + topRow * exp_vec_first.w;

    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-2, 0), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord, 0).rgb;
    texel_2 = textureLod(colorTex, texCoord + params.offset * vec2( 2, 0), 0).rgb;
    middleRow = isOdd.x ? texel_0 : texel_2;
    middleRow += texel_1;
    middleRow += dFdxFine(middleRow) * t.x;
    middleRow = (texel_0 + texel_2) * exp_vec.z + texel_1 + middleRow * exp_vec_first.x;

    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-2, 2), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord + params.offset * vec2( 0, 2), 0).rgb;
    texel_2 = textureLod(colorTex, texCoord + params.offset * vec2( 2, 2), 0).rgb;
    bottomRow = isOdd.x ? texel_0 : texel_2;
    bottomRow += texel_1;
    bottomRow += dFdxFine(bottomRow) * t.x;
    bottomRow = (texel_0 + texel_2) * exp_vec_second.x + texel_1 * exp_vec_first.z + bottomRow * exp_vec_first.w;

    texel_0 = topRow + middleRow + bottomRow;
    topRow = (isOdd.y ? topRow : bottomRow) * exp_vec_second.y;
    topRow += middleRow * exp_vec.x;
    topRow += dFdyFine(topRow) * t.y;

    color= vec4((texel_0 + topRow) / w, 1.0);
}

void blur7x7()
{
    const bvec2 isOdd = bvec2(ivec2(gl_FragCoord.xy) & 1);
    const vec2 t = vec2(isOdd) * -2.0 + 1.0;

    const vec4 exp_vec_first = exp(vec4(1.0, 2.0, 4.0, 5.0) * params.gaussian_divisor);
    const vec4 exp_vec_second = exp(vec4(8.0, 9.0, 10.0, 13.0) * params.gaussian_divisor);
    const vec4 exp_vec_third = exp(vec4(18.0, 3.0, -1.0, -5.0) * params.gaussian_divisor);
    const float w = 1.0 + 4.0 * (exp_vec_first.x + exp_vec_first.y + exp_vec_first.z
                                + exp_vec_second.x + exp_vec_second.y + exp_vec_third.x
                                + 2.0 * (exp_vec_first.w + exp_vec_second.z + exp_vec_second.w));

    vec3 row_0, row_1, row_2, row_3;
    vec3 texel_0, texel_1, texel_2, texel_3;

    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-3, -3), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord + params.offset * vec2(-1, -3), 0).rgb;
    texel_2 = textureLod(colorTex, texCoord + params.offset * vec2( 1, -3), 0).rgb;
    texel_3 = textureLod(colorTex, texCoord + params.offset * vec2( 3, -3), 0).rgb;
    row_0 = (isOdd.x ? texel_0 + texel_2 : texel_1 + texel_3) * exp_vec_second.w;
    row_0 += (isOdd.x ? texel_1 : texel_2) * exp_vec_second.y;
    row_0 += dFdxFine(row_0) * t.x;
    row_0 += (texel_0 + texel_3) * exp_vec_third.x + (texel_1 + texel_2) * exp_vec_second.z;

    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-3, -1), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord + params.offset * vec2(-1, -1), 0).rgb;
    texel_2 = textureLod(colorTex, texCoord + params.offset * vec2( 1, -1), 0).rgb;
    texel_3 = textureLod(colorTex, texCoord + params.offset * vec2( 3, -1), 0).rgb;
    row_1 = (isOdd.x ? texel_0 + texel_2 : texel_1 + texel_3) * exp_vec_first.w;
    row_1 += (isOdd.x ? texel_1 : texel_2) * exp_vec_first.x;
    row_1 += dFdxFine(row_1) * t.x;
    row_1 += (texel_0 + texel_3) * exp_vec_second.z + (texel_1 + texel_2) * exp_vec_first.y;

    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-3, 1), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord + params.offset * vec2(-1, 1), 0).rgb;
    texel_2 = textureLod(colorTex, texCoord + params.offset * vec2( 1, 1), 0).rgb;
    texel_3 = textureLod(colorTex, texCoord + params.offset * vec2( 3, 1), 0).rgb;
    row_2 = (isOdd.x ? texel_0 + texel_2 : texel_1 + texel_3) * exp_vec_first.w;
    row_2 += (isOdd.x ? texel_1 : texel_2) * exp_vec_first.x;
    row_2 += dFdxFine(row_2) * t.x;
    row_2 += (texel_0 + texel_3) * exp_vec_second.z + (texel_1 + texel_2) * exp_vec_first.y;

    texel_0 = textureLod(colorTex, texCoord + params.offset * vec2(-3, 3), 0).rgb;
    texel_1 = textureLod(colorTex, texCoord + params.offset * vec2(-1, 3), 0).rgb;
    texel_2 = textureLod(colorTex, texCoord + params.offset * vec2( 1, 3), 0).rgb;
    texel_3 = textureLod(colorTex, texCoord + params.offset * vec2( 3, 3), 0).rgb;
    row_3 = (isOdd.x ? texel_0 + texel_2 : texel_1 + texel_3) * exp_vec_second.w;
    row_3 += (isOdd.x ? texel_1 : texel_2) * exp_vec_second.y;
    row_3 += dFdxFine(row_3) * t.x;
    row_3 += (texel_0 + texel_3) * exp_vec_third.x + (texel_1 + texel_2) * exp_vec_second.z;

    texel_0 = row_0 + row_1 + row_2 + row_3;
    texel_1 = (isOdd.y ? row_0 : row_3) * exp_vec_third.w;
    texel_1 += (isOdd.y ? row_1 : row_2) * exp_vec_third.z;
    texel_1 += (isOdd.y ? row_2 : row_1) * exp_vec_third.y;
    texel_1 += dFdyFine(texel_1) * t.y;
    
    color = vec4((texel_1 + texel_0) / w, 1.0);
}

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