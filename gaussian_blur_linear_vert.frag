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
    const vec2 discrete_weights = vec2(0.5, exp(params.gaussian_divisor));
	const float linear_weight = discrete_weights.x + discrete_weights.y;
    // const float weights_sum = 2 * linear_weight;
    const float texOffset = discrete_weights.y / linear_weight * params.offset.y;

    vec3 sum = textureLod(colorTex, texCoord - vec2(0, texOffset), 0).rgb;
    sum += textureLod(colorTex, texCoord + vec2(0, texOffset), 0).rgb;
    // color = vec4(sum * linear_weight / weights_sum, 1.0);
    color = vec4(sum * 0.5, 1.0);
}

void blur5x5()
{
    const vec2 discrete_weights = exp(vec2(1.0, 4.0) * params.gaussian_divisor); 
    const float linear_weight = discrete_weights.x + discrete_weights.y;
    const float weights_sum = 1.0 + 2.0 * linear_weight;
    const float texOffset = (discrete_weights.x + 2.0 * discrete_weights.y) / linear_weight * params.offset.y;

    vec3 sum = textureLod(colorTex, texCoord - vec2(0, texOffset), 0).rgb;
    sum = (sum + textureLod(colorTex, texCoord + vec2(0, texOffset), 0).rgb) * linear_weight;
    sum += textureLod(colorTex, texCoord, 0).rgb;
    color = vec4(sum / weights_sum, 1.0);
}

void blur7x7()
{
    const vec4 discrete_weights = vec4(0.5, exp(vec3(1.0, 4.0, 9.0) * params.gaussian_divisor));
    const float weights_sum = (discrete_weights.x + discrete_weights.y + discrete_weights.z + discrete_weights.w) * 2.0;
    const vec2 linear_weights = vec2(discrete_weights.x + discrete_weights.y, discrete_weights.z + discrete_weights.w);
    const vec2 texOffsets = vec2(discrete_weights.y, 2.0 * discrete_weights.z + 3.0 * discrete_weights.w) / linear_weights * params.offset.y;

    vec3 sum = (textureLod(colorTex, texCoord - vec2(0, texOffsets.x), 0).rgb +
                textureLod(colorTex, texCoord + vec2(0, texOffsets.x), 0).rgb) * linear_weights.x;
    sum += (textureLod(colorTex, texCoord - vec2(0, texOffsets.y), 0).rgb +
            textureLod(colorTex, texCoord + vec2(0, texOffsets.y), 0).rgb) * linear_weights.y;
    color = vec4(sum / weights_sum, 1.0);
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