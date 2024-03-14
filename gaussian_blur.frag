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
    const vec2 exp_vec = exp(vec2(1.0, 2.0) * params.gaussian_divisor);
    const float w = 1.0 + 4.0 * (exp_vec.x + exp_vec.y);

    vec3 tmp_x, tmp_y; // for exp_vec.x and y parts;
    vec3 central;

    tmp_y  = textureLod(colorTex, texCoord + params.offset * vec2(-1, -1), 0).rgb;
    tmp_x  = textureLod(colorTex, texCoord + params.offset * vec2( 0, -1), 0).rgb;
    tmp_y += textureLod(colorTex, texCoord + params.offset * vec2( 1, -1), 0).rgb;
    
    tmp_x += textureLod(colorTex, texCoord + params.offset * vec2(-1,  0), 0).rgb;
    sum    = textureLod(colorTex, texCoord, 0).rgb;
    tmp_x += textureLod(colorTex, texCoord + params.offset * vec2( 1,  0), 0).rgb;
    
    tmp_y += textureLod(colorTex, texCoord + params.offset * vec2(-1,  1), 0).rgb;
    tmp_x += textureLod(colorTex, texCoord + params.offset * vec2( 0,  1), 0).rgb;
    tmp_y += textureLod(colorTex, texCoord + params.offset * vec2( 1,  1), 0).rgb;
    
    central += tmp_x * exp_vec.x + tmp_y * exp_vec.y;
    color = vec4(central / w, 1.0);
}

void blur5x5()
{
    const vec4 exp_vec = exp(vec4(1.0, 2.0, 4.0, 5.0) * params.gaussian_divisor);
    const float exp_last = exp(8.0 * params.gaussian_divisor);
    const float w = 1.0 + 4.0 * (exp_vec.x + exp_vec.y + exp_vec.z + 2.0 * exp_vec.w + exp_last);

    vec3 tmp_x, tmp_y, tmp_z, tmp_w, tmp_last;
    vec3 central;

    tmp_last  = textureLod(colorTex, texCoord + params.offset * vec2(-2, -2), 0).rgb;
    tmp_w     = textureLod(colorTex, texCoord + params.offset * vec2(-1, -2), 0).rgb;
    tmp_z     = textureLod(colorTex, texCoord + params.offset * vec2( 0, -2), 0).rgb;
    tmp_w    += textureLod(colorTex, texCoord + params.offset * vec2( 1, -2), 0).rgb;
    tmp_last += textureLod(colorTex, texCoord + params.offset * vec2( 2, -2), 0).rgb;

    tmp_w    += textureLod(colorTex, texCoord + params.offset * vec2(-2, -1), 0).rgb;
    tmp_y     = textureLod(colorTex, texCoord + params.offset * vec2(-1, -1), 0).rgb;
    tmp_x     = textureLod(colorTex, texCoord + params.offset * vec2( 0, -1), 0).rgb;
    tmp_y    += textureLod(colorTex, texCoord + params.offset * vec2( 1, -1), 0).rgb;
    tmp_w    += textureLod(colorTex, texCoord + params.offset * vec2( 2, -1), 0).rgb;

    tmp_z    += textureLod(colorTex, texCoord + params.offset * vec2(-2,  0), 0).rgb;
    tmp_x    += textureLod(colorTex, texCoord + params.offset * vec2(-1,  0), 0).rgb;
    central   = textureLod(colorTex, texCoord, 0).rgb;
    tmp_x    += textureLod(colorTex, texCoord + params.offset * vec2( 1,  0), 0).rgb;
    tmp_z    += textureLod(colorTex, texCoord + params.offset * vec2( 2,  0), 0).rgb;
    
    tmp_w    += textureLod(colorTex, texCoord + params.offset * vec2(-2,  1), 0).rgb;
    tmp_y    += textureLod(colorTex, texCoord + params.offset * vec2(-1,  1), 0).rgb;
    tmp_x    += textureLod(colorTex, texCoord + params.offset * vec2( 0,  1), 0).rgb;
    tmp_y    += textureLod(colorTex, texCoord + params.offset * vec2( 1,  1), 0).rgb;
    tmp_w    += textureLod(colorTex, texCoord + params.offset * vec2( 2,  1), 0).rgb;

    tmp_last += textureLod(colorTex, texCoord + params.offset * vec2(-2, 2), 0).rgb;
    tmp_w    += textureLod(colorTex, texCoord + params.offset * vec2(-1, 2), 0).rgb;
    tmp_z    += textureLod(colorTex, texCoord + params.offset * vec2( 0, 2), 0).rgb;
    tmp_w    += textureLod(colorTex, texCoord + params.offset * vec2( 1, 2), 0).rgb;
    tmp_last += textureLod(colorTex, texCoord + params.offset * vec2( 2, 2), 0).rgb;

    central += tmp_x * exp_vec.x + tmp_y * exp_vec.y + tmp_z * exp_vec.z + tmp_w * exp_vec.w + tmp_last * exp_last;
    color = vec4(central / w, 1.0);
}

void blur7x7()
{
    const vec4 exp_vec_first = exp(vec4(1.0, 2.0, 4.0, 5.0) * params.gaussian_divisor);
    const vec4 exp_vec_second = exp(vec4(8.0, 9.0, 10.0, 13.0) * params.gaussian_divisor);
    const float exp_last = exp(18.0 * params.gaussian_divisor);
    const float w = 1.0 + 4.0 * (exp_vec_first.x + exp_vec_first.y + exp_vec_first.z
                                + exp_vec_second.x + exp_vec_second.y + exp_last
                                + 2.0 * (exp_vec_first.w + exp_vec_second.z + exp_vec_second.w));

    vec3 central, tmp_first_x, tmp_first_y, tmp_first_z, tmp_first_w,
        tmp_last, tmp_second_x, tmp_second_y, tmp_second_z, tmp_second_w;

    tmp_last      = textureLod(colorTex, texCoord + params.offset * vec2(-3, -3), 0).rgb;
    tmp_second_w  = textureLod(colorTex, texCoord + params.offset * vec2(-2, -3), 0).rgb;
    tmp_second_z  = textureLod(colorTex, texCoord + params.offset * vec2(-1, -3), 0).rgb;
    tmp_second_y  = textureLod(colorTex, texCoord + params.offset * vec2( 0, -3), 0).rgb;
    tmp_second_z += textureLod(colorTex, texCoord + params.offset * vec2( 1, -3), 0).rgb;
    tmp_second_w += textureLod(colorTex, texCoord + params.offset * vec2( 2, -3), 0).rgb;
    tmp_last     += textureLod(colorTex, texCoord + params.offset * vec2( 3, -3), 0).rgb;

    tmp_second_w += textureLod(colorTex, texCoord + params.offset * vec2(-3, -2), 0).rgb;
    tmp_second_x  = textureLod(colorTex, texCoord + params.offset * vec2(-2, -2), 0).rgb;
    tmp_first_w   = textureLod(colorTex, texCoord + params.offset * vec2(-1, -2), 0).rgb;
    tmp_first_z   = textureLod(colorTex, texCoord + params.offset * vec2( 0, -2), 0).rgb;
    tmp_first_w  += textureLod(colorTex, texCoord + params.offset * vec2( 1, -2), 0).rgb;
    tmp_second_x += textureLod(colorTex, texCoord + params.offset * vec2( 2, -2), 0).rgb;
    tmp_second_w += textureLod(colorTex, texCoord + params.offset * vec2( 3, -2), 0).rgb;

    tmp_second_z += textureLod(colorTex, texCoord + params.offset * vec2(-3, -1), 0).rgb;
    tmp_first_w  += textureLod(colorTex, texCoord + params.offset * vec2(-2, -1), 0).rgb;
    tmp_first_y   = textureLod(colorTex, texCoord + params.offset * vec2(-1, -1), 0).rgb;
    tmp_first_x   = textureLod(colorTex, texCoord + params.offset * vec2( 0, -1), 0).rgb;
    tmp_first_y  += textureLod(colorTex, texCoord + params.offset * vec2( 1, -1), 0).rgb;
    tmp_first_w  += textureLod(colorTex, texCoord + params.offset * vec2( 2, -1), 0).rgb;
    tmp_second_z += textureLod(colorTex, texCoord + params.offset * vec2( 3, -1), 0).rgb;

    tmp_second_y += textureLod(colorTex, texCoord + params.offset * vec2(-3,  0), 0).rgb;
    tmp_first_z  += textureLod(colorTex, texCoord + params.offset * vec2(-2,  0), 0).rgb;
    tmp_first_x  += textureLod(colorTex, texCoord + params.offset * vec2(-1,  0), 0).rgb;
    central       = textureLod(colorTex, texCoord, 0).rgb;
    tmp_first_x  += textureLod(colorTex, texCoord + params.offset * vec2( 1,  0), 0).rgb;
    tmp_first_z  += textureLod(colorTex, texCoord + params.offset * vec2( 2,  0), 0).rgb;
    tmp_second_y += textureLod(colorTex, texCoord + params.offset * vec2( 3,  0), 0).rgb;

    tmp_second_z += textureLod(colorTex, texCoord + params.offset * vec2(-3,  1), 0).rgb;
    tmp_first_w  += textureLod(colorTex, texCoord + params.offset * vec2(-2,  1), 0).rgb;
    tmp_first_y  += textureLod(colorTex, texCoord + params.offset * vec2(-1,  1), 0).rgb;
    tmp_first_x  += textureLod(colorTex, texCoord + params.offset * vec2( 0,  1), 0).rgb;
    tmp_first_y  += textureLod(colorTex, texCoord + params.offset * vec2( 1,  1), 0).rgb;
    tmp_first_w  += textureLod(colorTex, texCoord + params.offset * vec2( 2,  1), 0).rgb;
    tmp_second_z += textureLod(colorTex, texCoord + params.offset * vec2( 3,  1), 0).rgb;

    tmp_second_w += textureLod(colorTex, texCoord + params.offset * vec2(-3,  2), 0).rgb;
    tmp_second_x += textureLod(colorTex, texCoord + params.offset * vec2(-2,  2), 0).rgb;
    tmp_first_w  += textureLod(colorTex, texCoord + params.offset * vec2(-1,  2), 0).rgb;
    tmp_first_z  += textureLod(colorTex, texCoord + params.offset * vec2( 0,  2), 0).rgb;
    tmp_first_w  += textureLod(colorTex, texCoord + params.offset * vec2( 1,  2), 0).rgb;
    tmp_second_x += textureLod(colorTex, texCoord + params.offset * vec2( 2,  2), 0).rgb;
    tmp_second_w += textureLod(colorTex, texCoord + params.offset * vec2( 3,  2), 0).rgb;

    tmp_last     += textureLod(colorTex, texCoord + params.offset * vec2(-3,  3), 0).rgb;
    tmp_second_w += textureLod(colorTex, texCoord + params.offset * vec2(-2,  3), 0).rgb;
    tmp_second_z += textureLod(colorTex, texCoord + params.offset * vec2(-1,  3), 0).rgb;
    tmp_second_y += textureLod(colorTex, texCoord + params.offset * vec2( 0,  3), 0).rgb;
    tmp_second_z += textureLod(colorTex, texCoord + params.offset * vec2( 1,  3), 0).rgb;
    tmp_second_w += textureLod(colorTex, texCoord + params.offset * vec2( 2,  3), 0).rgb;
    tmp_last     += textureLod(colorTex, texCoord + params.offset * vec2( 3,  3), 0).rgb;

    central += tmp_first_x * exp_vec_first.x + tmp_first_y * exp_vec_first.y
                + tmp_first_z * exp_vec_first.z + tmp_first_w * exp_vec_first.w
                + tmp_second_x * exp_vec_second.x + tmp_second_y * exp_vec_second.y
                + tmp_second_z * exp_vec_second.z + tmp_second_w * exp_vec_second.w
                + tmp_last * exp_last;
    color = vec4(central / w, 1.0);
}

void main()
{  
    if (WINDOW_R == 1)
        blur3x3();
    else if (WINDOW_R == 2)
        blur5x5();
    else if (WINDOW_R == 3)
        blur7x7();
}