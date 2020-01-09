import { Component, Input, OnChanges } from '@angular/core';
import { AbstractControl, FormBuilder } from 'ngx-strongly-typed-forms';

import { Address, Hero, states } from '../data-model';
import { HeroService } from '../hero.service';

interface HeroFormModel {
  name: string;
  secretLairs: Address[];
  power: string;
  sidekick: string;
}

function nameIncludesPowerValidator(control: AbstractControl<HeroFormModel>) {
  const { name, power } = control.value;
  if (name && power && !new RegExp(power, 'i').test(name)) {
    return { nameValidation: 'Name does not contain Power' };
  }
  return null;
}

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})

export class HeroDetailComponent implements OnChanges {
  @Input() hero: Hero;

  readonly heroForm = this.fb.group({
    name: this.fb.control(''),
    // need to prepopulate the array so that the type inference has something to work on
    secretLairs: this.fb.array([this.addressControls(new Address())]),
    power: this.fb.control(''),
    sidekick: this.fb.control('')
  },
    // {validator: nameIncludesPowerValidator}
  );
  readonly secretLairs = this.heroForm.controls.secretLairs;

  nameChangeLog: string[] = [];
  states = states;

  constructor(private fb: FormBuilder,
    private heroService: HeroService) {
    // clean up the lair added for type inference
    this.secretLairs.clear();
    this.logNameChange();
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

  setAddresses(addresses: Address[]) {
    this.secretLairs.clear();
    addresses.forEach(this.addLair.bind(this));
  }

  addLair(address = new Address()) {
    this.secretLairs.push(this.addressControls(address));
  }

  private addressControls(address: Address) {
    const controls = this.fb.group({
      street: this.fb.control(''),
      city: this.fb.control(''),
      state: this.fb.control(''),
      zip: this.fb.control(''),
    });
    controls.setValue(address);
    return controls;
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
      (value) => this.nameChangeLog.push(value)
    );
  }
}
