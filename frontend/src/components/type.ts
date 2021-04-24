export enum IRekognitionType {
    HAPPY = 'HAPPY',
    SAD = 'SAD',
    ANGRY = 'ANGRY',
    CONFUSED = 'CONFUSED',
    DISGUSTED = 'DISGUSTED',
    SURPRISED = 'SURPRISED',
    CALM = 'CALM',
    UNKNOWN = 'UNKNOWN',
    FEAR = 'FEAR'
};
  
type IRekognitionTypeKeys = keyof typeof IRekognitionType;
type IRekognitionKeyFields = {[key in IRekognitionTypeKeys]?: number}

export interface IRekognitionObject extends IRekognitionKeyFields{
    n: number
}

export interface IRekognitionItem {
    type: IRekognitionType,
    confidence: number
}