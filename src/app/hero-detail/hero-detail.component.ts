import { Component, Input, OnChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from 'ngx-strongly-typed-forms';

import { Address, Hero, states } from '../data-model';
import { HeroService } from '../hero.service';

interface HeroFormModel {
  name: string;
  secretLairs: Address[];
  power: string;
  sidekick: string;
}

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})

export class HeroDetailComponent implements OnChanges {
  @Input() hero: Hero;

  heroForm: FormGroup<HeroFormModel>;
  nameChangeLog: string[] = [];
  states = states;

  constructor(private fb: FormBuilder,
              private heroService: HeroService) {

    this.createForm();
    this.logNameChange();
  }

  createForm() {
    this.heroForm = this.fb.group<HeroFormModel>({
      name: '',
      secretLairs: this.fb.array<Address>([]),
      power: '',
      sidekick: ''
    });
  }

  ngOnChanges() {
    this.rebuildForm();
  }

  rebuildForm() {
    this.heroForm.reset({
      name: this.hero.name
    });
    this.setAddresses(this.hero.addresses);
  }

  get secretLairs(): FormArray<Address> {
    return this.heroForm.get('secretLairs') as FormArray<Address>;
  }

  setAddresses(addresses: Address[]) {
    const addressFGs = addresses.map(address => this.fb.group<Address>(address));
    const addressFormArray = this.fb.array<Address>(addressFGs);
    this.heroForm.setControl('secretLairs', addressFormArray);
  }

  addLair() {
    this.secretLairs.push(this.fb.group(new Address()));
  }

  onSubmit() {
    this.hero = this.prepareSaveHero();
    this.heroService.updateHero(this.hero).subscribe(/* error handling */);
    this.rebuildForm();
  }

  prepareSaveHero(): Hero {
    const formModel = this.heroForm.value;

    // deep copy of form model lairs
    const secretLairsDeepCopy: Address[] = formModel.secretLairs.map(
      (address: Address) => Object.assign({}, address)
    );

    // return new `Hero` object containing a combination of original hero value(s)
    // and deep copies of changed form model values
    const saveHero: Hero = {
      id: this.hero.id,
      name: formModel.name,
      // addresses: formModel.secretLairs // <-- bad!
      addresses: secretLairsDeepCopy
    };
    return saveHero;
  }

  revert() {
    this.rebuildForm();
  }

  logNameChange() {
    const nameControl = this.heroForm.get('name');
    nameControl.valueChanges.forEach(
      (value: string) => this.nameChangeLog.push(value)
    );
  }
}
