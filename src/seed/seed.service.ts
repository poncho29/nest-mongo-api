import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response';
import { AxiosAdapter } from 'src/common/adapters/axios-adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    // Opción 1. Crear varias insercciones a la bd
    // const insertPromiseArray = [];

    // data.results.forEach(({ name, url }) => {
    //   const segments = url.split('/');
    //   const no = +segments[segments.length - 2];

    //   await this.pokemonModel.create({ name, no });
    //   insertPromiseArray.push(this.pokemonModel.create({ name, no }));
    // });

    // await Promise.all(insertPromiseArray);

    // Opción 2: Solo hace un insección a la bd
    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      pokemonToInsert.push({ name, no });
    });

    this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed executed';
  }
}
